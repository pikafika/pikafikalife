import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const geminiApiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY

  return {
  plugins: [
    react(),
    {
      name: 'configure-server',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/logs' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const logDir = path.resolve(__dirname, 'logs');
                if (!fs.existsSync(logDir)) {
                  fs.mkdirSync(logDir);
                }
                const logPath = path.join(logDir, 'activity.log');
                const logData = JSON.parse(body);
                const logLine = `[${new Date(logData.timestamp).toISOString()}] [${logData.type.toUpperCase()}] ${logData.message} - ${logData.details || ''}\n`;
                fs.appendFileSync(logPath, logLine);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true }));
              } catch (error) {
                console.error('Error writing log to file:', error);
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: 'Failed to write log' }));
              }
            });
          } else if (req.url === '/api/gemini' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
              const send = (status: number, data: unknown) => {
                res.statusCode = status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              };
              try {
                const { type, logs, image, mode, userContext } = JSON.parse(body);
                const apiKey = geminiApiKey;
                if (!apiKey) return send(500, { error: "API Key is missing in .env" });

                const MODEL = "gemini-2.5-flash";
                const BASE_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${apiKey}`;

                if (type === "vision") {
                  const prompt = mode === 'food'
                    ? `당신은 1형 당뇨인을 위한 영양사입니다. 사진 속 음식을 분석하여 각 재료명, 양(숫자), 단위(g,인분 등), 탄수화물(g)을 JSON으로 반환하세요. JSON 형식: { "items": [{ "id", "name", "amount", "unit", "carbs", "icon" }], "advice" }. 한글로 답변하세요.`
                    : `영양성분표 라벨에서 제품명, 총 탄수화물(g), 당류(g), 1회 제공량 및 단위를 추출하세요. JSON 형식: { "productName", "totalCarbs", "sugars", "servingSize", "servingUnit", "advice" }. 한글로 답변하세요.`;

                  if (!image || typeof image !== 'string') return send(400, { error: "이미지 데이터가 올바르지 않습니다." });
                  const base64Data = image.includes(',') ? image.split(",")[1] : image;

                  const resp = await fetch(BASE_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: "image/jpeg", data: base64Data } }] }]
                    })
                  });
                  const data = await resp.json();
                  if (!resp.ok) throw new Error("AI 서비스에 일시적인 오류가 발생했습니다.");
                  const text = data.candidates[0].content.parts[0].text;
                  const match = text.match(/\{[\s\S]*\}/);
                  return send(200, JSON.parse(match ? match[0] : text.trim()));

                } else if (type === "insights") {
                  const prompt = `Analyze these logs for a Type 1 diabetic and provide 4 personalized health insights in Korean. Return JSON array: ${JSON.stringify((logs || []).slice(0, 10))}`;
                  const resp = await fetch(BASE_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                  });
                  const data = await resp.json();
                  if (!resp.ok) throw new Error("AI 서비스에 일시적인 오류가 발생했습니다.");
                  const text = data.candidates[0].content.parts[0].text;
                  const match = text.match(/\[[\s\S]*\]/);
                  return send(200, JSON.parse(match ? match[0] : text.trim()));

                } else if (type === "coaching") {
                  const prompt = `1형 당뇨 관리 코치로서 다음 기록을 분석하고 한국어로 상세 코칭 리포트를 작성하세요: ${JSON.stringify((logs || []).slice(0, 20))}`;
                  const resp = await fetch(BASE_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                  });
                  const data = await resp.json();
                  if (!resp.ok) throw new Error("AI 서비스에 일시적인 오류가 발생했습니다.");
                  return send(200, { report: data.candidates[0].content.parts[0].text });

                } else {
                  return send(400, { error: "Invalid type" });
                }
              } catch (error) {
                console.error('[Dev Gemini Proxy]', error);
                send(500, { error: error instanceof Error ? error.message : 'Failed to process AI request' });
              }
            });
          } else {
            next();
          }
        });
      },
    },
  ],
  server: {
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  }
})
