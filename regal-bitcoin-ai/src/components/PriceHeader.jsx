export default function PriceHeader({ market }) {
  if (!market) {
    return (
      <div className="price-header price-header--loading">
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--price" />
      </div>
    );
  }

  const up = Number(market.change24h) >= 0;
  const fmt = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });

  return (
    <div className="price-header">
      <div className="price-header__title">
        <h1>{market.asset}</h1>
        <span className="price-header__symbol">{market.symbol}</span>
      </div>

      <div className="price-header__price">
        <span className="price-header__value">${fmt(market.price)}</span>
        <span className={`price-header__change ${up ? 'is-up' : 'is-down'}`}>
          {up ? '▲' : '▼'} {Math.abs(Number(market.change24h)).toFixed(2)}%
        </span>
      </div>

      <div className="price-header__stats">
        <div>
          <span className="stat-label">24h High</span>
          <span className="stat-value">${fmt(market.high24h)}</span>
        </div>
        <div>
          <span className="stat-label">24h Low</span>
          <span className="stat-value">${fmt(market.low24h)}</span>
        </div>
        <div>
          <span className="stat-label">24h Volume</span>
          <span className="stat-value">
            {Number(market.volume24h).toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}
