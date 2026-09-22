import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

import { config } from './server/config/env.js';
import apiRoutes from './server/routes/api.js';
import { notFoundHandler, errorHandler } from './server/middleware/errorHandler.js';
import { startMarketPolling } from './server/services/binanceService.js';
import { getActiveProviderName, isProviderConfigured } from './server/services/aiProviders/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = __dirname;

const app = express();
app.use(cors());
app.use(express.json({ limit: '128kb' }));
app.use('/api', apiRoutes);
app.use(notFoundHandler);

const distPath = path.join(projectRoot, 'dist');

async function start() {
  startMarketPolling();

  if (config.isProduction && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.use((_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  } else {
    const vite = await createViteServer({
      root: projectRoot,
      server: { middlewareMode: true, hmr: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.use(errorHandler);

  app.listen(config.port, () => {
    console.log(`\nRegal AI running at http://localhost:${config.port}`);
    const provider = getActiveProviderName();
    console.log(
      isProviderConfigured()
        ? `AI provider: ${provider} (configured)`
        : `AI provider: ${provider} — NOT configured, chat will use local fallback. Set the API key in .env.`
    );
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
