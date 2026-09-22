import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { api } from '../api/client.js';

const INTERVALS = ['5m', '15m', '1h', '4h', '1d'];

export default function PriceChart({ symbol }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [interval, setInterval_] = useState('15m');
  const [error, setError] = useState(null);

  // Create the chart instance once.
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9aa3b2',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      timeScale: { borderColor: 'rgba(255,255,255,0.08)' },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)' },
      width: containerRef.current.clientWidth,
      height: 360,
    });

    const series = chart.addCandlestickSeries({
      upColor: '#d4af37',
      downColor: '#5b5f6b',
      borderVisible: false,
      wickUpColor: '#d4af37',
      wickDownColor: '#5b5f6b',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Load candles whenever the coin or interval changes.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { candles } = await api.klines(symbol, interval, 150);
        if (!cancelled && seriesRef.current) {
          seriesRef.current.setData(candles);
          chartRef.current?.timeScale().fitContent();
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }

    load();
    const poll = window.setInterval(load, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, [symbol, interval]);

  return (
    <div className="chart-card">
      <div className="chart-card__toolbar">
        {INTERVALS.map((i) => (
          <button
            key={i}
            className={`chart-toolbar__btn${i === interval ? ' is-active' : ''}`}
            onClick={() => setInterval_(i)}
          >
            {i}
          </button>
        ))}
      </div>
      {error && <div className="chart-card__error">Couldn't load chart: {error}</div>}
      <div ref={containerRef} className="chart-card__canvas" />
    </div>
  );
}
