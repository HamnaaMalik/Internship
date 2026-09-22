import { config } from '../config/env.js';
import { COINS } from '../data/coins.js';

/**
 * In-memory cache of the latest snapshot per Binance symbol (e.g. BTCUSDT).
 * A lightweight background poller refreshes this on an interval so API
 * requests never have to wait on an outbound call.
 */
const cache = new Map();
let pollTimer = null;

function toSnapshot(ticker, coin) {
  const price = Number(ticker.lastPrice);
  const change = Number(ticker.priceChangePercent);
  return {
    symbol: `${coin.symbol}/USDT`,
    asset: coin.name,
    price,
    change24h: change,
    high24h: Number(ticker.highPrice),
    low24h: Number(ticker.lowPrice),
    volume24h: Number(ticker.quoteVolume),
    updatedAt: Date.now(),
  };
}

async function fetchTicker(binanceSymbol) {
  const url = `${config.binanceRestUrl}/ticker/24hr?symbol=${binanceSymbol}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Binance responded ${res.status} for ${binanceSymbol}`);
  return res.json();
}

async function refreshAll() {
  const results = await Promise.allSettled(
    COINS.map(async (coin) => {
      const ticker = await fetchTicker(coin.binanceSymbol);
      cache.set(coin.symbol, toSnapshot(ticker, coin));
    })
  );

  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length) {
    console.warn(`[market] ${failed.length}/${COINS.length} ticker updates failed this cycle`);
  }
}

export function startMarketPolling() {
  if (!config.useLiveMarketData) {
    console.log('[market] Live market data disabled (USE_LIVE_MARKET_DATA=false)');
    return;
  }
  refreshAll().catch((err) => console.error('[market] initial fetch failed:', err.message));
  pollTimer = setInterval(() => {
    refreshAll().catch((err) => console.error('[market] poll failed:', err.message));
  }, config.marketPollIntervalMs);
  pollTimer.unref?.();
}

export function stopMarketPolling() {
  if (pollTimer) clearInterval(pollTimer);
}

export function getSnapshot(symbol) {
  return cache.get(String(symbol || '').toUpperCase()) || null;
}

export function getAllSnapshots() {
  return COINS.map((c) => cache.get(c.symbol)).filter(Boolean);
}

export function hasLiveData() {
  return cache.size > 0;
}

/**
 * Proxies Binance's public klines (candlestick) endpoint so the frontend
 * chart never needs a direct browser connection to Binance.
 */
export async function fetchKlines(binanceSymbol, interval = '15m', limit = 100) {
  const url = `${config.binanceRestUrl}/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Binance klines request failed with ${res.status}`);
  const raw = await res.json();

  return raw.map((k) => ({
    time: Math.floor(k[0] / 1000), // seconds, as lightweight-charts expects
    open: Number(k[1]),
    high: Number(k[2]),
    low: Number(k[3]),
    close: Number(k[4]),
    volume: Number(k[5]),
  }));
}
