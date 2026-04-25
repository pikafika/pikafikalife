import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-1.5-flash";

export default async function handler(req: any, res: any) {
  // CORS Configuration
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // preflight request 무시
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // POST 이외의 요청 거부
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 서버의 환경 변수에 안전하게 저장된 API 키를 읽습니다. 
  // 프론트엔드의 VITE_ 접두어를 뗄 수 있도록 백업 처리
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: "Server configuration Error: API key is missing" });
  }

  const { type, logs, settings, history } = req.body;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  try {
    if (type === "insights") {
      const recentLogsContext = JSON.stringify(logs?.slice(0, 10) || []);
      const prompt = `
        You are an expert coach for Type 1 Diabetics. 
        Based on the following user settings and recent log data, provide 4 varied and helpful insights (Recipe, Exercise, General Tip, Personal Story).
        
        User Settings: ${JSON.stringify(settings || {})}
        Recent Logs: ${recentLogsContext}
        
        Format the output as a JSON array of objects. 
        Object structure:
        {
          "id": number,
          "title": "string (e.g., 식단 꿀팁, 전문가 조언)",
          "label": "string",
          "color": "string (Tailwind classes like 'bg-warm-100 text-warm-600')",
          "icon": "string (Emoji)",
          "content": {
            "subtitle": "string",
            "description": "string",
            "tips": ["string"],
            "deepDive": { "title": "string", "body": "string" }
          }
        }
        
        Language: Korean. 
        Make it feel warm, professional, and encouraging. 
        Avoid medical jargon, explain simply.
        Return ONLY the JSON array.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json|```/g, "").trim();
      return res.status(200).json(JSON.parse(cleanJson));

    } else if (type === "coaching") {
      if (!logs || logs.length === 0) {
        return res.status(200).json({ report: "아직 분석할 데이터가 충분하지 않습니다. 평소처럼 식사와 혈당 기록을 남겨주시면 정밀한 분석 리포트를 드릴 수 있어요! ✨" });
      }

      const prompt = `
        You are a specialized Lifestyle & Wellness Coach for Type 1 Diabetics. 
        Analyze the recent logs and provide a professional, encouraging coaching report.
        Recent Logs: ${JSON.stringify(logs)}
        Past Coaching Summaries: ${history?.join("\n") || "None"}
        Language: Korean. Return a clean, structured text.
      `;

      const result = await model.generateContent(prompt);
      return res.status(200).json({ report: result.response.text() });

    } else if (type === "vision") {
      const { image, mode, userContext } = req.body;
      if (!image) return res.status(400).json({ error: "Image is required" });

      const prompt = mode === 'food' 
        ? `Analyze this food image. JSON: { items: [{id, name, amount, unit, carbs, icon}], advice }. Korean.`
        : `Extract nutrition facts (carbs, sugars, serving) from this label. JSON: { productName, totalCarbs, sugars, servingSize, servingUnit, advice }. Korean.`;

      const imageParts = [{ inlineData: { data: image.split(",")[1], mimeType: "image/jpeg" } }];
      const result = await model.generateContent([prompt, ...imageParts]);
      const text = result.response.text();
      const cleanJson = text.replace(/```json|```/g, "").trim();
      return res.status(200).json(JSON.parse(cleanJson));

    } else {
      return res.status(400).json({ error: "Invalid type requested" });
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error?.message?.includes("SAFETY")) {
      return res.status(403).json({ error: "보안 정책 혹은 안전 필터로 인해 리포트를 생성할 수 없습니다." });
    }
    return res.status(500).json({ error: "Failed to generate content from AI model" });
  }
}
