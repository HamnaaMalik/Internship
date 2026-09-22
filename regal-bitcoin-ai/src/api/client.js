const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }
  return data;
}

export const api = {
  health: () => request('/health'),
  coins: () => request('/market/coins'),
  allMarkets: () => request('/market/all'),
  market: (symbol) => request(`/market/${symbol}`),
  klines: (symbol, interval = '15m', limit = 100) =>
    request(`/market/${symbol}/klines?interval=${interval}&limit=${limit}`),
  chat: (payload) =>
    request('/chat', { method: 'POST', body: JSON.stringify(payload) }),
};
