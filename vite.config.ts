import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
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
              try {
                const { type, logs, settings, history, image, mode, userContext } = JSON.parse(body);
                const apiKey = process.env.VITE_GEMINI_API_KEY;
                
                if (!apiKey) {
                  res.statusCode = 500;
                  return res.end(JSON.stringify({ error: "API Key is missing in .env" }));
                }

                // Node환경에서 fetch를 사용하거나 직접 SDK 호출
                // 여기서는 프론트에서 사용하는 것과 동일하게 동작하도록 응답
                // 실제 API 호출은 백엔드 로직(api/gemini.ts)과 동일하게 수행
                const { GoogleGenerativeAI } = await import("@google/generative-ai");
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                if (type === "vision") {
                  const prompt = mode === 'food' 
                    ? `Analyze this food image. JSON: { items: [{id, name, amount, unit, carbs, icon}], advice }. Korean.`
                    : `Extract nutrition facts (carbs, sugars, serving) from this label. JSON: { productName, totalCarbs, sugars, servingSize, servingUnit, advice }. Korean.`;

                  const imageParts = [{ inlineData: { data: image.split(",")[1], mimeType: "image/jpeg" } }];
                  const result = await model.generateContent([prompt, ...imageParts]);
                  const text = result.response.text();
                  const cleanJson = text.replace(/```json|```/g, "").trim();
                  res.statusCode = 200;
                  res.end(cleanJson);
                } else if (type === "insights") {
                  const prompt = `You are a coach for Type 1 Diabetics. Provide 4 insights based on logs: ${JSON.stringify(logs?.slice(0,10))}. Return JSON array. Korean.`;
                  const result = await model.generateContent(prompt);
                  const text = result.response.text();
                  const cleanJson = text.replace(/```json|```/g, "").trim();
                  res.statusCode = 200;
                  res.end(cleanJson);
                } else {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: "Unsupported type" }));
                }
              } catch (error) {
                console.error('Gemini Local Proxy Error:', error);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Failed to process AI request' }));
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
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
