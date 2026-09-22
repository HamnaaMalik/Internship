export default function Sidebar({ snapshots, activeSymbol, onSelect, loading }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__brand-mark">R</span>
        <span className="sidebar__brand-text">Regal</span>
      </div>

      <div className="sidebar__label">Markets</div>

      <div className="sidebar__list">
        {loading && snapshots.length === 0 && (
          <div className="sidebar__loading">Loading live prices…</div>
        )}

        {snapshots.map((s) => {
          const ticker = s.symbol.split('/')[0];
          const isActive = ticker === activeSymbol;
          const up = Number(s.change24h) >= 0;
          return (
            <button
              key={s.symbol}
              className={`coin-row${isActive ? ' coin-row--active' : ''}`}
              onClick={() => onSelect(ticker)}
            >
              <div className="coin-row__id">
                <span className="coin-row__symbol">{ticker}</span>
                <span className="coin-row__name">{s.asset}</span>
              </div>
              <div className="coin-row__data">
                <span className="coin-row__price">
                  ${Number(s.price).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </span>
                <span className={`coin-row__change ${up ? 'is-up' : 'is-down'}`}>
                  {up ? '▲' : '▼'} {Math.abs(Number(s.change24h)).toFixed(2)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
