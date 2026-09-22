import { COINS, findCoinMention } from '../data/coins.js';
import { getAllSnapshots, getSnapshot } from '../services/binanceService.js';
import { money, compact, pctString, parseMagnitude } from './formatters.js';
import {
  isGreeting,
  isAllCoinsQuery,
  isExplainQuestion,
  matchRangeQuery,
  matchUnderQuery,
  matchAboveQuery,
} from './intent.js';

function referencePrice(coin) {
  const snap = getSnapshot(coin.symbol);
  return snap ? snap.price : null;
}

function coinsInRange(min, max) {
  return COINS.filter((c) => {
    const p = referencePrice(c);
    return p !== null && p >= min && p <= max;
  });
}

function formatCoinsInRange(min, max) {
  const matching = coinsInRange(min, max);
  if (!matching.length) {
    return (
      `I couldn't find a tracked coin priced between **$${money(min)}** and **$${money(max)}** ` +
      `right now. Try "all coins" to see the full live price list.`
    );
  }
  let res = `Here are the tracked cryptocurrencies trading in the **$${money(min)} – $${money(
    max
  )}** range:\n\n`;
  matching.forEach((c, idx) => {
    const p = referencePrice(c);
    res += `${idx + 1}. **${c.name} (${c.symbol})**: $${money(p)} — ${c.desc}\n`;
  });
  return res;
}

function formatAllCoinsTable(activeSymbol) {
  const snapshots = getAllSnapshots();
  const bySymbol = new Map(snapshots.map((s) => [s.symbol.split('/')[0], s]));

  let res = `## 📊 Live Market Overview\n\nTop cryptocurrencies tracked, with current prices:\n\n`;
  res += `| # | Coin | Symbol | Price | 24h Change | Category |\n`;
  res += `|---|------|--------|-------|------------|----------|\n`;

  COINS.forEach((c, i) => {
    const snap = bySymbol.get(c.symbol);
    const isActive = activeSymbol && c.symbol === activeSymbol;
    const priceCell = snap ? `$${money(snap.price)}${isActive ? ' *(viewing)*' : ''}` : 'n/a';
    const changeCell = snap ? pctString(snap.change24h) : 'n/a';
    res += `| ${i + 1} | ${c.name} | **${c.symbol}** | ${priceCell} | ${changeCell} | ${c.category} |\n`;
  });

  res += `\n> 💡 Click any coin in the sidebar for its live chart. Ask *"what is [coin]"* for a deep-dive.`;
  return res;
}

function formatCoinExplainer(coin, market) {
  const activeTicker = String(market?.symbol || '').split('/')[0].toUpperCase();
  const isActiveCoin = activeTicker === coin.symbol;
  const priceLine = isActiveCoin
    ? `**Current price**: $${money(market.price)} (${pctString(market.change24h)} 24h) — range $${money(
        market.low24h
      )} – $${money(market.high24h)}.`
    : `Switch to **${coin.symbol}** from the sidebar to see its live chart and price.`;

  return (
    `## ${coin.name} (${coin.symbol})\n\n` +
    `**What it is**: ${coin.desc}\n\n` +
    `**How it works**: ${coin.howItWorks}\n\n` +
    `**What it's used for**: ${coin.useCase}\n\n` +
    `**⚠️ Good to know**: ${coin.tip}\n\n` +
    `---\n${priceLine}`
  );
}

function formatPrice(market) {
  const sym = market?.symbol || 'this coin';
  return (
    `## ${market?.asset || 'Coin'} (${sym}) — Live Price\n\n` +
    `• **Price**: $${money(market?.price)} (${pctString(market?.change24h)} in 24h)\n` +
    `• **24h High**: $${money(market?.high24h)}\n` +
    `• **24h Low**: $${money(market?.low24h)}\n` +
    `• **24h Volume**: ${compact(market?.volume24h)}\n\n` +
    `${Number(market?.change24h) >= 0 ? '📈 Trading higher over the last 24 hours.' : '📉 Trading lower over the last 24 hours.'}`
  );
}

function greetingReply() {
  return (
    `👋 **Hey! Welcome to Regal AI.**\n\nI'm your crypto intelligence assistant. I can help with:\n\n` +
    `• 📈 Live prices & market data\n` +
    `• 🔍 Coin deep-dives (ask "what is BTC")\n` +
    `• 💹 Trading guidance — spot vs futures, risk management\n` +
    `• 🏦 DeFi, staking, wallets & security\n` +
    `• 📊 Technical analysis basics\n\n` +
    `What would you like to explore?`
  );
}

function helpReply(market) {
  return (
    `## 🤖 Regal AI — What Can I Help You With?\n\n` +
    `| Category | Example |\n|---|---|\n` +
    `| 📊 Live Prices | "all coin prices", "price of BTC" |\n` +
    `| 🔍 Coin Info | "what is Ethereum?" |\n` +
    `| 💰 Price Ranges | "coins under $100" |\n` +
    `| 📈 Trading | "how to start trading", "spot vs futures" |\n` +
    `| 🛡️ Risk | "how to set stop-loss" |\n` +
    `| 🏦 DeFi | "how does staking work?" |\n\n` +
    (market ? `**Currently viewing**: ${market.symbol} at $${money(market.price)} (${pctString(market.change24h)}).` : '')
  );
}

/**
 * Fast local fallback — handles greetings, price lookups, coin explainers,
 * and price-range queries without needing an AI call. Anything else falls
 * through to the AI provider.
 */
export function localAssistantReply(message, market) {
  const q = String(message || '').trim();
  const l = q.toLowerCase();

  if (isGreeting(q)) return greetingReply();
  if (isAllCoinsQuery(l)) return formatAllCoinsTable(market?.symbol?.split('/')[0]);

  const range = matchRangeQuery(l);
  if (range) {
    let min = parseMagnitude(range[1]);
    let max = parseMagnitude(range[2]);
    if (min > max) [min, max] = [max, min];
    if (max > 0) return formatCoinsInRange(min, max);
  }

  const under = matchUnderQuery(l);
  if (under) return formatCoinsInRange(0, parseMagnitude(under[1]));

  const above = matchAboveQuery(l);
  if (above) return formatCoinsInRange(parseMagnitude(above[1]), 10_000_000);

  if (isExplainQuestion(l)) {
    const coin = findCoinMention(l);
    if (coin) return formatCoinExplainer(coin, market);
  }

  if (/price|rate|worth|value/i.test(l)) return formatPrice(market);

  return helpReply(market);
}
