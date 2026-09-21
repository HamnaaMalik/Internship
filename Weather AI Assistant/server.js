import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { handleAIRequest } from './lib/weatherAI.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 5173);
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

app.use(cors());
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ai: Boolean(GEMINI_API_KEY), model: GEMINI_MODEL });
});

app.post('/api/ai', async (req, res) => {
  const { message, weather, conversation = [] } = req.body || {};
  const result = await handleAIRequest({ message, weather, conversation, GEMINI_API_KEY, GEMINI_MODEL });
  res.status(result.status).json(result.body);
});

const distPath = path.join(__dirname, 'dist');
const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(distPath);

if (isProduction && fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((_req, res) => { res.sendFile(path.join(distPath, 'index.html')); });
} else {
  const vite = await createViteServer({ root: __dirname, server: { middlewareMode: true, hmr: true }, appType: 'spa' });
  app.use(vite.middlewares);
}

app.listen(PORT, () => {
  console.log(`Weather Hub running at http://localhost:${PORT}`);
  console.log(GEMINI_API_KEY ? `✅ AI enabled: ${GEMINI_MODEL}` : '⚠️  AI running on local fallback — add GEMINI_API_KEY to .env to enable Gemini.');
});
