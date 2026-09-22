import Sidebar from './components/Sidebar.jsx';
import PriceHeader from './components/PriceHeader.jsx';
import PriceChart from './components/PriceChart.jsx';
import ChatPanel from './components/ChatPanel.jsx';
import { useMarketData } from './hooks/useMarketData.js';

export default function App() {
  const { snapshots, active, activeSymbol, setActiveSymbol, loading, error } = useMarketData('BTC');

  return (
    <div className="app-shell">
      <Sidebar
        snapshots={snapshots}
        activeSymbol={activeSymbol}
        onSelect={setActiveSymbol}
        loading={loading}
      />

      <main className="main-panel">
        {error && (
          <div className="banner banner--error">
            Live market data unavailable: {error}
          </div>
        )}
        <PriceHeader market={active} />
        <PriceChart symbol={activeSymbol} />
      </main>

      <ChatPanel market={active} />
    </div>
  );
}
