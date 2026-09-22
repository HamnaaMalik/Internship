/**
 * Reference metadata for coins tracked by the dashboard.
 * `binanceSymbol` maps each coin to its Binance USDT trading pair so the
 * market service can pull real live prices instead of guessing.
 */
export const COINS = [
  {
    symbol: 'BTC',
    binanceSymbol: 'BTCUSDT',
    name: 'Bitcoin',
    category: 'Store of Value',
    desc: 'The original cryptocurrency and the market benchmark by capitalization.',
    howItWorks:
      'A decentralized, peer-to-peer digital currency secured by Proof-of-Work mining, with a hard-capped supply of 21 million coins.',
    useCase:
      'Widely treated as a long-term store of value ("digital gold") and the asset the rest of the market tends to follow.',
    tip: 'Because BTC moves the whole market, check its trend before trading altcoins.',
  },
  {
    symbol: 'ETH',
    binanceSymbol: 'ETHUSDT',
    name: 'Ethereum',
    category: 'Smart Contracts',
    desc: 'The leading smart-contract and decentralized application platform.',
    howItWorks:
      'Runs smart contracts on a Proof-of-Stake blockchain, letting developers build DeFi apps, NFTs, and other on-chain programs.',
    useCase: 'Powers most of the DeFi and NFT ecosystem; ETH also pays network "gas fees".',
    tip: 'ETH is typically more volatile than BTC — size positions accordingly.',
  },
  {
    symbol: 'BNB',
    binanceSymbol: 'BNBUSDT',
    name: 'BNB',
    category: 'Exchange Token',
    desc: 'Utility token for the BNB Chain and Binance ecosystem.',
    howItWorks:
      'Used for trading fee discounts on Binance and as gas for BNB Smart Chain, with periodic supply burns.',
    useCase: 'Popular for lower-fee trading and as the native gas token across BNB Chain DeFi apps.',
    tip: 'Exchange-tied tokens can react to exchange-specific news, not just broad market moves.',
  },
  {
    symbol: 'SOL',
    binanceSymbol: 'SOLUSDT',
    name: 'Solana',
    category: 'Layer 1',
    desc: 'A high-speed, low-cost layer-1 blockchain.',
    howItWorks:
      'Combines Proof-of-Stake with "Proof-of-History" timestamps to process thousands of transactions per second at low fees.',
    useCase: 'Popular for trading apps, NFTs, and consumer crypto apps that need speed and cheap fees.',
    tip: 'Historically volatile with occasional network congestion — favored by active traders.',
  },
  {
    symbol: 'XRP',
    binanceSymbol: 'XRPUSDT',
    name: 'XRP',
    category: 'Payments',
    desc: 'A cross-border digital settlement network.',
    howItWorks:
      'Uses its own consensus protocol (not mining) to settle transactions in seconds, built for cross-border payment settlement.',
    useCase: 'Marketed toward payment providers and banks needing fast, low-cost international settlement.',
    tip: 'Price has historically been sensitive to regulatory/legal news specific to Ripple.',
  },
  {
    symbol: 'ADA',
    binanceSymbol: 'ADAUSDT',
    name: 'Cardano',
    category: 'Smart Contracts',
    desc: 'A Proof-of-Stake smart contract platform.',
    howItWorks:
      'Built through a peer-reviewed, research-driven process on a Proof-of-Stake consensus called Ouroboros.',
    useCase: 'Aimed at emerging markets, identity, and supply-chain use cases.',
    tip: 'Development is slower and more methodical than some competitors — useful context for roadmap comparisons.',
  },
  {
    symbol: 'DOGE',
    binanceSymbol: 'DOGEUSDT',
    name: 'Dogecoin',
    category: 'Meme / Payments',
    desc: 'A popular decentralized peer-to-peer meme currency.',
    howItWorks:
      'A Proof-of-Work coin forked from Litecoin, with no fixed max supply — new coins are minted continuously.',
    useCase: 'Used for tipping, small payments, and as a highly liquid sentiment-driven trading asset.',
    tip: 'Price is largely sentiment/news-driven rather than fundamentals-driven — expect sharp moves.',
  },
  {
    symbol: 'DOT',
    binanceSymbol: 'DOTUSDT',
    name: 'Polkadot',
    category: 'Interoperability',
    desc: 'A multi-chain interoperability protocol.',
    howItWorks:
      'Connects independent blockchains ("parachains") to a shared relay chain so they can communicate and share security.',
    useCase: 'For projects that want a custom blockchain while tapping into shared network security.',
    tip: 'A more infrastructure-focused, longer-horizon asset than consumer-facing tokens.',
  },
  {
    symbol: 'AVAX',
    binanceSymbol: 'AVAXUSDT',
    name: 'Avalanche',
    category: 'Smart Contracts',
    desc: 'A scalable smart-contract platform.',
    howItWorks:
      'Uses multiple interoperable blockchains ("subnets") under one network for fast finality and custom app-specific chains.',
    useCase: 'Aimed at enterprises and dApps needing custom, high-throughput chains.',
    tip: 'Mid-cap altcoin — more volatile than BTC/ETH, less than smaller-cap tokens.',
  },
  {
    symbol: 'LINK',
    binanceSymbol: 'LINKUSDT',
    name: 'Chainlink',
    category: 'Oracle',
    desc: 'The industry-standard decentralized oracle network.',
    howItWorks:
      'Feeds real-world data (like price feeds) onto blockchains through a decentralized network of node operators.',
    useCase: 'Nearly all major DeFi protocols rely on Chainlink price feeds — it is critical infrastructure.',
    tip: 'Value tracks overall DeFi/on-chain activity, since more dApps means more oracle demand.',
  },
  {
    symbol: 'UNI',
    binanceSymbol: 'UNIUSDT',
    name: 'Uniswap',
    category: 'DeFi',
    desc: 'The largest decentralized automated market maker (DEX).',
    howItWorks:
      'Uses liquidity pools and a constant-product formula instead of an order book — anyone can supply tokens and earn swap fees.',
    useCase: 'The go-to decentralized exchange for swapping tokens without a centralized intermediary.',
    tip: 'If providing liquidity yourself, learn about "impermanent loss" first.',
  },
  {
    symbol: 'AAVE',
    binanceSymbol: 'AAVEUSDT',
    name: 'Aave',
    category: 'DeFi',
    desc: 'A leading decentralized liquidity and lending protocol.',
    howItWorks:
      'Lets users lend crypto to earn interest or borrow against collateral, all managed by smart contracts.',
    useCase: 'A core DeFi "money market"; AAVE holders also get governance rights and fee-sharing.',
    tip: 'Understand liquidation risk before using the lending side, not just holding the token.',
  },
];

export function findCoinBySymbol(symbol) {
  const s = String(symbol || '').toUpperCase();
  return COINS.find((c) => c.symbol === s) || null;
}

/** Finds which tracked coin (if any) is mentioned in free text. */
export function findCoinMention(text) {
  const l = String(text || '').toLowerCase();
  return (
    COINS.find((c) => {
      const symRe = new RegExp(`\\b${c.symbol.toLowerCase()}\\b`);
      const firstWord = c.name.toLowerCase().split(/[\s(]/)[0];
      const nameRe = new RegExp(`\\b${firstWord}\\b`);
      return symRe.test(l) || nameRe.test(l);
    }) || null
  );
}
