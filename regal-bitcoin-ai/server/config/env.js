import 'dotenv/config';

function bool(value, fallback) {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === 'true';
}

export const config = {
  port: Number(process.env.PORT || 5173),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // AI provider: 'gemini' | 'openai'
  aiProvider: (process.env.AI_PROVIDER || 'gemini').toLowerCase(),

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },

  // Live market data
  binanceRestUrl: 'https://api.binance.com/api/v3',
  marketPollIntervalMs: Number(process.env.MARKET_POLL_INTERVAL_MS || 5000),
  useLiveMarketData: bool(process.env.USE_LIVE_MARKET_DATA, true),

  // Chat behaviour
  chatHistoryLimit: Number(process.env.CHAT_HISTORY_LIMIT || 8),
  chatMaxOutputTokens: Number(process.env.CHAT_MAX_OUTPUT_TOKENS || 2048),
};

export function assertAiConfigured() {
  const provider = config.aiProvider;
  if (provider === 'gemini' && !config.gemini.apiKey) return false;
  if (provider === 'openai' && !config.openai.apiKey) return false;
  return true;
}
