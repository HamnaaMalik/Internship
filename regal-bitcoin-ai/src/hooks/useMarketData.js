import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';

const POLL_MS = 5000;

export function useMarketData(initialSymbol = 'BTC') {
  const [snapshots, setSnapshots] = useState([]);
  const [activeSymbol, setActiveSymbol] = useState(initialSymbol);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const { snapshots: data } = await api.allMarkets();
        if (!cancelled) {
          setSnapshots(data);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    poll();
    timerRef.current = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timerRef.current);
    };
  }, []);

  const active = snapshots.find((s) => s.symbol.startsWith(`${activeSymbol}/`)) || null;

  return { snapshots, active, activeSymbol, setActiveSymbol, loading, error };
}
