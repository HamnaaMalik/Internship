import { findCoinMention } from '../data/coins.js';

const GREETING_RE =
  /^(hi|hello|hey|heyy|hiya|salam|salaam|assalam[- ]o[- ]alaikum|aoa|good\s+(morning|afternoon|evening|night)|hola|bonjour|hallo)\s*[!.?]*$/iu;

export function isGreeting(text) {
  return GREETING_RE.test(String(text || '').trim());
}

export function isAllCoinsQuery(text) {
  return /\b(all\s*coins?|all\s*crypto(currencies)?|all\s*price|all\s*market|full\s*market|market\s*overview|market\s*summary|every\s*coin|list\s*(of\s*)?(all\s*)?coins?|top\s*coins?|top\s*crypto|leading\s*crypto)\b/i.test(
    text
  );
}

export function isNewsQuestion(text) {
  return /\b(latest|news|headline|headlines|breaking|update|updates|what happened|today|recent|current news)\b/i.test(
    text
  );
}

export function isExplainQuestion(text) {
  return /\b(what is|what's|whats|explain|tell me about|how does .* work|info (on|about)|about)\b/i.test(
    text || ''
  );
}

const RANGE_RE =
  /(?:between|bw|b\/w|from|and|till|to)?\s*\$?([0-9]+\.?[0-9]*k?)\s*(?:-|to|and|till)\s*\$?([0-9]+\.?[0-9]*k?)/i;
const UNDER_RE = /(?:under|below|less than|<)\s*\$?([0-9]+\.?[0-9]*k?)/i;
const ABOVE_RE = /(?:above|greater than|more than|>)\s*\$?([0-9]+\.?[0-9]*k?)/i;

export function matchRangeQuery(text) {
  return text.match(RANGE_RE);
}
export function matchUnderQuery(text) {
  return text.match(UNDER_RE);
}
export function matchAboveQuery(text) {
  return text.match(ABOVE_RE);
}

/**
 * Questions cheap/fast enough to answer instantly from local logic without
 * calling out to an LLM — greetings, simple price lookups, coin explainers.
 */
export function isInstantLocalQuery(text) {
  const q = String(text || '').trim().toLowerCase();
  if (isGreeting(q)) return true;
  if (isAllCoinsQuery(q)) return true;
  if (/^(price|trend|volume|24h range|24h|range)$/i.test(q)) return true;
  if (matchRangeQuery(q)) return true;
  if (matchUnderQuery(q)) return true;
  if (matchAboveQuery(q)) return true;
  if (isExplainQuestion(q) && findCoinMention(q)) return true;
  return false;
}
