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
          } else {
            next();
          }
        });
      },
    },
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
