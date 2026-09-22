import { Router } from 'express';
import { config } from '../config/env.js';
import { COINS } from '../data/coins.js';
import { getSnapshot, getAllSnapshots, hasLiveData, fetchKlines } from '../services/binanceService.js';
import { askAi, getActiveProviderName, isProviderConfigured } from '../services/aiProviders/index.js';
import { isInstantLocalQuery, isNewsQuestion, isGreeting } from '../utils/intent.js';
import { localAssistantReply } from '../utils/localAssistant.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    aiProvider: getActiveProviderName(),
    aiConfigured: isProviderConfigured(),
    liveMarketData: hasLiveData(),
  });
});

router.get('/market/coins', (_req, res) => {
  res.json({ coins: COINS.map(({ symbol, name, category }) => ({ symbol, name, category })) });
});

router.get('/market/all', (_req, res) => {
  res.json({ snapshots: getAllSnapshots() });
});

router.get('/market/:symbol', (req, res) => {
  const snapshot = getSnapshot(req.params.symbol);
  if (!snapshot) {
    return res.status(404).json({ error: `No live data yet for "${req.params.symbol}".` });
  }
  res.json(snapshot);
});

router.get('/market/:symbol/klines', async (req, res) => {
  const coin = COINS.find((c) => c.symbol === req.params.symbol.toUpperCase());
  if (!coin) return res.status(404).json({ error: `Unknown coin "${req.params.symbol}".` });

  const interval = req.query.interval || '15m';
  const limit = Math.min(Number(req.query.limit) || 100, 500);

  try {
    const candles = await fetchKlines(coin.binanceSymbol, interval, limit);
    res.json({ symbol: coin.symbol, interval, candles });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

router.post('/chat', async (req, res) => {
  const { message, market, conversation = [] } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required.' });
  }

  // Cheap, deterministic questions never need to hit an LLM.
  if (isInstantLocalQuery(message)) {
    return res.json({ reply: localAssistantReply(message, market), provider: 'local' });
  }

  if (isGreeting(message)) {
    return res.json({ reply: 'Hi! How can I help you with crypto trading or market data today?', provider: 'local' });
  }

  if (!isProviderConfigured()) {
    return res.json({
      reply: localAssistantReply(message, market),
      provider: 'local-fallback',
      warning: `${config.aiProvider} API key is not configured on the server.`,
    });
  }

  try {
    const result = await askAi({
      message,
      market,
      conversation,
      newsQuestion: isNewsQuestion(message),
    });
    return res.json(result);
  } catch (err) {
    console.error(`[chat] ${config.aiProvider} error:`, err.message);
    return res.json({
      reply: localAssistantReply(message, market),
      provider: 'local-fallback',
      warning: err.message,
    });
  }
});

export default router;
