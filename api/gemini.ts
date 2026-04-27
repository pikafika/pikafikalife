export default async function handler(req: any, res: any) {
  // CORS Configuration
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key is missing" });

  const { type, image, mode, userContext, logs, settings, history } = req.body;
  const MODEL_NAME = "gemini-2.5-flash";

  try {
    // [진단] 사용 가능한 모델 목록 직접 조회
    try {
      const listResp = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
      const listData = await listResp.json();
      console.log("Direct Model List:", listData.models?.map((m: any) => m.name));
    } catch (e) {
      console.error("Failed to list models via direct fetch:", e);
    }

    if (type === "vision") {
      const prompt = mode === 'food' 
        ? `당신은 1형 당뇨인을 위한 영양사입니다. 사진 속 음식을 분석하여 각 재료명, 양(숫자), 단위(g,인분 등), 탄수화물(g)을 JSON으로 반환하세요. JSON 형식: { "items": [{ "id", "name", "amount", "unit", "carbs", "icon" }], "advice" }. 한글로 답변하세요.`
        : `영양성분표 라벨에서 제품명, 총 탄수화물(g), 당류(g), 1회 제공량 및 단위를 추출하세요. JSON 형식: { "productName", "totalCarbs", "sugars", "servingSize", "servingUnit", "advice" }. 한글로 답변하세요.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inlineData: { mimeType: "image/jpeg", data: image.split(",")[1] } }
              ]
            }]
          })
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        console.error("Gemini Direct Error:", data);
        throw new Error(data.error?.message || "AI 호출 실패");
      }

      const text = data.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : text.trim();
      
      return res.status(200).json(JSON.parse(cleanJson));

    } else if (type === "insights" || type === "coaching") {
      // 텍스트 기반 요청 처리 (SDK 대신 직접 호출)
      const prompt = type === "insights" ? `Analyze these logs for a diabetic: ${JSON.stringify(logs)}. Return 4 insights in JSON array.` : `Provide coaching: ${JSON.stringify(logs)}. Korean.`;
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;

      if (type === "insights") {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        return res.status(200).json(JSON.parse(jsonMatch ? jsonMatch[0] : text));
      }
      return res.status(200).json({ report: text });

    } else {
      return res.status(400).json({ error: "Invalid type" });
    }

  } catch (error: any) {
    console.error("Full Backend Error:", error);
    const keyPrefix = apiKey.substring(0, 4);
    return res.status(500).json({ error: `[Key:${keyPrefix}] ${error.message}` });
  }
}
