interface ApiRequest {
  method: string;
  body: {
    type?: string;
    image?: string;
    mode?: string;
    userContext?: string;
    logs?: unknown[];
    settings?: unknown;
    history?: string[];
  };
  headers: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => ApiResponse;
  end: () => void;
  setHeader: (name: string, value: string) => void;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://localhost:5173";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "서버 설정 오류가 발생했습니다." });

  const { type, image, mode, userContext, logs } = req.body;
  const safeLogs = Array.isArray(logs) ? logs.slice(0, 20) : [];
  const MODEL_NAME = "gemini-2.5-flash";

  try {
    if (type === "vision") {
      const prompt = mode === 'food'
        ? `당신은 1형 당뇨인을 위한 영양사입니다. 사진 속 음식을 분석하여 각 재료명, 양(숫자), 단위(g,인분 등), 탄수화물(g)을 JSON으로 반환하세요. JSON 형식: { "items": [{ "id", "name", "amount", "unit", "carbs", "icon" }], "advice" }. 한글로 답변하세요.`
        : `영양성분표 라벨에서 제품명, 총 탄수화물(g), 당류(g), 1회 제공량 및 단위를 추출하세요. JSON 형식: { "productName", "totalCarbs", "sugars", "servingSize", "servingUnit", "advice" }. 한글로 답변하세요.`;

      if (!image || typeof image !== 'string') {
        return res.status(400).json({ error: "이미지 데이터가 올바르지 않습니다." });
      }

      const base64Data = image.includes(',') ? image.split(",")[1] : image;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inlineData: { mimeType: "image/jpeg", data: base64Data } }
              ]
            }]
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error("AI 서비스에 일시적인 오류가 발생했습니다.");
      }

      const candidate = data.candidates?.[0];
      if (!candidate) throw new Error("AI 응답이 안전 필터에 의해 차단되었습니다.");
      const text = candidate.content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : text.trim();

      return res.status(200).json(JSON.parse(cleanJson));

    } else if (type === "insights" || type === "coaching") {
      const prompt = type === "insights"
        ? `당신은 1형 당뇨 전문 코치입니다. 아래 혈당 기록을 분석하여 건강 인사이트 4개를 JSON 배열로 반환하세요.
로그: ${JSON.stringify(safeLogs)}

반드시 아래 JSON 형식만 반환하고 다른 텍스트는 절대 포함하지 마세요:
[
  {
    "id": 101,
    "title": "카테고리명",
    "label": "인사이트 제목(20자 이내)",
    "color": "bg-brand-50 text-brand-600",
    "icon": "이모지 1개",
    "content": {
      "subtitle": "소제목",
      "description": "2~3문장 설명",
      "tips": ["팁1", "팁2", "팁3"]
    }
  }
]
id는 101~199 사이 숫자, icon은 반드시 이모지 1개, color는 반드시 Tailwind 클래스 문자열. 한국어로 작성.`
        : `Provide coaching: ${JSON.stringify(safeLogs)}. Korean.`;

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
      const candidate = data.candidates?.[0];
      if (!candidate) throw new Error("AI 응답이 안전 필터에 의해 차단되었습니다.");
      const text = candidate.content.parts[0].text;

      if (type === "insights") {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        return res.status(200).json(JSON.parse(jsonMatch ? jsonMatch[0] : text));
      }
      return res.status(200).json({ report: text });

    } else {
      return res.status(400).json({ error: "Invalid type" });
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return res.status(500).json({ error: message });
  }
}
