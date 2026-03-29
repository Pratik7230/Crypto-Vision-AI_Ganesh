export type Recommendation = "BUY" | "SELL" | "HOLD";
export type CoinCategory = "major" | "altcoin" | "digitalCoin" | "memeCoin";

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  sparkline: number[]; // 7 data points for chart
  color: string; // coin accent color
  category: CoinCategory;
}

export interface AISignal {
  coinSymbol: string;
  coinName: string;
  recommendation: Recommendation;
  confidence: number; // 0-100
  reasoning: string;
  timestamp: number;
}

// Coin accent colors for avatar circles
const COIN_COLORS: Record<string, string> = {
  BTC: "#f7931a",
  ETH: "#627eea",
  BNB: "#f3ba2f",
  SOL: "#9945ff",
  XRP: "#00aae4",
  ADA: "#0033ad",
  DOGE: "#c3a634",
  AVAX: "#e84142",
  MATIC: "#8247e5",
  DOT: "#e6007a",
  LINK: "#2a5ada",
  LTC: "#bfbbbb",
  UNI: "#ff007a",
  ATOM: "#2e3148",
  NEAR: "#00ec97",
  APT: "#3b82f6",
  ARB: "#12aaff",
  OP: "#ff0420",
  SUI: "#6fbcf0",
  INJ: "#00c2ff",
  USDT: "#26a17b",
  USDC: "#2775ca",
  DAI: "#f5ac37",
  TUSD: "#002868",
  SHIB: "#ffa409",
  PEPE: "#00a859",
  FLOKI: "#ff8c00",
  WIF: "#9b59b6",
  BONK: "#f97316",
  MEME: "#e91e8c",
  TURBO: "#8bc34a",
};

// Realistic AI reasoning templates
const BUY_REASONS: Record<string, string> = {
  BTC: "Strong momentum above 20-day EMA with institutional accumulation signals. Hash rate at all-time highs. On-chain metrics show whale accumulation phase.",
  ETH: "Layer-2 TVL expansion accelerating. ETH burn rate elevated post-merge. DeFi protocol inflows surging. Bullish engulfing on 4H chart.",
  BNB: "BNBChain DEX volume spike detected. Quarterly token burn upcoming. Ecosystem expansion with 15 new DApp launches this week.",
  SOL: "Network throughput record broken. NFT mint volume 340% above 30-day average. Developer activity at 6-month high.",
  XRP: "ODL payment corridor utilization up 28% WoW. Regulatory clarity boosting institutional adoption. Technical breakout from 3-month consolidation.",
  ADA: "Hydra scaling solution deployment imminent. Governance voting turnout record high. Smart contract TVL growing at 18% MoM.",
  DOGE: "Social sentiment index at 89/100. Large transaction volume spike on-chain. Community-driven momentum building.",
  AVAX: "Subnet deployment count doubled this month. C-Chain gas fees declining despite volume increase. Cross-chain bridge inflows positive.",
  MATIC:
    "zkEVM mainnet adoption surging. Enterprise partnerships announced. Gas efficiency improvements driving DeFi migration.",
  DOT: "Parachain auctions generating demand pressure. Staking yield optimization driving lock-up increase. Cross-chain messaging volume up.",
  LINK: "DECO off-chain compute protocol launch driving demand. New oracle integrations with 40+ DeFi protocols. Premium oracle fees increasing.",
  LTC: "MimbleWimble privacy upgrade fully deployed. Halving cycle positioning. Merchant adoption metrics improving.",
  UNI: "Protocol fee switch governance vote passing. V4 launch generating fee revenue surge. DEX market share recovering.",
  ATOM: "IBC transfer volume 3x growth this quarter. New zone connections adding ecosystem value. Liquid staking TVL expanding.",
  NEAR: "Nightshade sharding efficiency gains attracting Web3 developers. FastAuth user onboarding streamlined. VC funding inflows detected.",
  APT: "Aptos ecosystem growing rapidly with new DeFi protocols. Move language adoption increasing. TVL doubling quarter-over-quarter.",
  ARB: "Arbitrum One TVL surpassing $3B. New DeFi launches driving fee revenue. Governance participation increasing significantly.",
  OP: "Optimism Superchain vision gaining traction. Base and other chains driving OP token utility. Strong ecosystem momentum.",
  SUI: "SUI network achieving record TPS. Gaming and social dApps driving user adoption. Tokenomics improving with unlock schedules.",
  INJ: "Injective DeFi ecosystem booming. Cross-chain DEX volume at record highs. Institutional interest growing.",
  USDT: "Tether reserves fully audited. Cross-chain bridging volume increasing. Market maker demand elevated.",
  USDC: "Circle compliance strengthening institutional trust. USDC adoption in emerging markets accelerating.",
  DAI: "MakerDAO DSR yield attracting capital. DAI supply growing organically. Governance improving collateral diversity.",
  TUSD: "TrueUSD maintaining peg stability. Growing adoption in Asian markets. Compliance track record strong.",
  SHIB: "SHIB burn rate accelerating. Shibarium L2 adoption growing. Community governance active.",
  PEPE: "PEPE meme momentum resurging. Viral social media activity driving retail demand. Exchange listings expanding.",
  FLOKI:
    "Floki ecosystem expanding with gaming and NFTs. Marketing campaigns driving awareness. Utility tokens burning.",
  WIF: "WIF Solana meme coin momentum strong. Derivatives market demand increasing. Social sentiment at highs.",
  BONK: "BONK Solana ecosystem native token gaining utility. New integrations announced. Airdrop momentum continuing.",
  MEME: "MEME token narrative gaining traction. Polychain Capital interest noted. Community growing rapidly.",
  TURBO:
    "TURBO AI-generated meme coin narrative unique. Community growing exponentially. Listings on major CEXs imminent.",
};

const SELL_REASONS: Record<string, string> = {
  BTC: "Overbought RSI conditions on weekly chart. Miner distribution phase detected. Options market showing bearish put/call ratio shift.",
  ETH: "Gas fee spike reducing DeFi activity. Large ETH unlock from staking contracts imminent. Bearish divergence on MACD.",
  BNB: "Smart money outflows detected from BNBChain. Centralization concerns reducing institutional appetite. Resistance at key Fibonacci level.",
  SOL: "Network congestion reducing validator efficiency. Large holder distribution phase. Funding rates elevated — overheated derivatives market.",
  XRP: "Whale wallets reducing positions. Technical rejection at $0.70 resistance. Short-term momentum stalling.",
  ADA: "Developer commits on main repo declining. TVL stagnation relative to competitors. Breaking below 50-day moving average.",
  DOGE: "Whale addresses showing distribution signals. Retail sentiment peaking — typical reversal indicator. No fundamental catalyst.",
  AVAX: "VC unlock schedule shows significant token release upcoming. Competing L1s capturing market share. Technical double-top formation.",
  MATIC:
    "Ethereum L1 improvements reducing urgency for L2 solutions. Network bridging volume declining. Key support broken.",
  DOT: "Governance stalemate on key protocol upgrades. Competing cross-chain solutions gaining traction. RSI showing exhaustion.",
  LINK: "Competing oracle solutions gaining protocol integrations. Near-term selling pressure from team vesting schedule.",
  LTC: "Post-halving sell-the-news pattern emerging. Competition from newer privacy chains. Volume declining on recent pumps.",
  UNI: "DEX market share declining to CEX alternatives. Fee revenue below expectations. Governance participation apathy growing.",
  ATOM: "ICS revenue model questioned by validators. Chain security budget uncertainty. Bearish weekly close pattern.",
  NEAR: "Team token vesting cliff approaching. User retention metrics declining after initial spike. Competitive pressure from other L1s.",
  APT: "APT token unlocks creating selling pressure. Ecosystem still early — revenue metrics lag valuations.",
  ARB: "ARB airdrop recipients continuing distribution. Governance uncertainty. Competitor chains outperforming.",
  OP: "OP token vesting schedule showing large unlock. Superchain competition intensifying internally.",
  SUI: "SUI insider unlock schedule concerning. Gaming dApps underperforming expectations. TVL growth slowing.",
  INJ: "INJ showing overbought conditions. Competitor DEXs gaining market share. Profit-taking at resistance.",
  SHIB: "SHIB sell pressure from early whale wallets. Meme cycle cooling. Competition from newer tokens.",
  PEPE: "PEPE speculative bubble signs. Volume declining on price pumps. Risk/reward unfavorable at current levels.",
  FLOKI:
    "FLOKI team wallet movements concerning. Game launch delayed again. Marketing fatigue evident.",
  WIF: "WIF showing distribution patterns. Solana meme season rotation beginning. Smart money exiting.",
  BONK: "BONK price rejected at resistance. New Solana meme tokens diverting attention. Volume declining.",
  MEME: "MEME token hype cycle ending. Team token distribution upcoming. Better opportunities elsewhere.",
  TURBO:
    "TURBO facing regulatory scrutiny. Meme narratives fading. Low liquidity creates exit risk.",
  USDT: "Holding USDT during bull market opportunity cost high. Tether regulatory concerns persist.",
  USDC: "USDC banking risk still present. Circle expansion slower than expected. Yield alternatives superior.",
  DAI: "DAI overcollateralization inefficiency growing concern. Regulatory pressure on DeFi protocols.",
  TUSD: "TUSD audit delays concerning. Market share shrinking vs USDT/USDC. Liquidity thin on some pairs.",
};

const HOLD_REASONS: Record<string, string> = {
  BTC: "Consolidating in established range. Macro uncertainty warrants patience. Accumulating volume suggests next directional move imminent.",
  ETH: "Neutral market structure. Awaiting ETH staking APY reset catalyst. Risk/reward balanced — hold positions.",
  BNB: "Sideways price action within Bollinger Bands. Awaiting quarterly burn event for directional clarity.",
  SOL: "Healthy consolidation after recent rally. Fundamentals strong but near-term catalyst absent. Maintain current positions.",
  XRP: "Range-bound between key support/resistance. Legal proceedings resolution timeline unclear. Monitor for breakout signal.",
  ADA: "Neutral sentiment. Development milestones on schedule but market timing uncertain. Hold pending next governance event.",
  DOGE: "Social sentiment stabilizing. No clear directional bias. Community events upcoming may trigger movement.",
  AVAX: "Subnet ecosystem growing but price action neutral. Competition intensifying. Wait for clear trend establishment.",
  MATIC:
    "zkEVM transition driving uncertainty. Both bullish and bearish cases valid. Risk-adjusted hold recommended.",
  DOT: "Parachain ecosystem maturing — quality over quantity phase. Market neutral positioning advised.",
  LINK: "Oracle market growing but LINK price decoupled from utility growth. Monitor for re-coupling signal.",
  LTC: "Range compression typical pre-halving. Optimal to hold while watching volume signals for direction.",
  UNI: "V4 development timeline uncertain. Competitors gaining ground. Preserve capital while monitoring governance.",
  ATOM: "IBC ecosystem expanding but ATOM utility debate ongoing. Neutral positioning appropriate.",
  NEAR: "Promising technology but market adoption lagging. Developer growth positive. Hold with close monitoring.",
  APT: "APT in accumulation zone. Long-term thesis intact but near-term catalyst absent.",
  ARB: "ARB ecosystem healthy but token price disconnected from fundamentals. Patient hold warranted.",
  OP: "OP Superchain vision compelling but timeline uncertain. Neutral positioning while monitoring adoption.",
  SUI: "SUI technology impressive but tokenomics overhang persists. Cautious accumulation mode.",
  INJ: "INJ fundamentals strong but market cooling. Hold existing positions, avoid new entry.",
  SHIB: "SHIB burn mechanics improving long-term outlook. Near-term neutral — hold core position.",
  PEPE: "PEPE trading range established. Meme momentum neither building nor declining. Monitor social signals.",
  FLOKI:
    "FLOKI project milestones progressing. Price neutral pending game launch confirmation.",
  WIF: "WIF consolidating after strong run. Healthy base building. Hold with stop below support.",
  BONK: "BONK Solana ecosystem position stable. No immediate catalyst. Monitor BTC correlation.",
  MEME: "MEME speculative position — maintain small exposure. Market structure neutral.",
  TURBO:
    "TURBO high-risk speculative hold. Only maintain if comfortable with volatility.",
  USDT: "USDT appropriate during uncertainty. Market conditions warrant holding stable position.",
  USDC: "USDC stable position rational while awaiting clearer market direction.",
  DAI: "DAI yield-bearing position sensible. DSR providing passive income while waiting.",
  TUSD: "TUSD stable but reduce exposure gradually in favor of higher-liquidity stablecoins.",
};

// Seed coin data
const SEED_COINS: Omit<Coin, "sparkline">[] = [
  // MAJOR COINS
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    price: 67432,
    change24h: 4.2,
    volume24h: 28_400_000_000,
    marketCap: 1_327_000_000_000,
    color: COIN_COLORS.BTC,
    category: "major",
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    price: 3512,
    change24h: 2.8,
    volume24h: 14_200_000_000,
    marketCap: 422_000_000_000,
    color: COIN_COLORS.ETH,
    category: "major",
  },
  {
    id: "binancecoin",
    symbol: "BNB",
    name: "BNB",
    price: 598,
    change24h: -1.4,
    volume24h: 1_800_000_000,
    marketCap: 87_000_000_000,
    color: COIN_COLORS.BNB,
    category: "major",
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    price: 178,
    change24h: 6.7,
    volume24h: 3_600_000_000,
    marketCap: 79_000_000_000,
    color: COIN_COLORS.SOL,
    category: "major",
  },

  // ALTCOINS
  {
    id: "xrp",
    symbol: "XRP",
    name: "XRP",
    price: 0.62,
    change24h: -4.1,
    volume24h: 2_100_000_000,
    marketCap: 34_000_000_000,
    color: COIN_COLORS.XRP,
    category: "altcoin",
  },
  {
    id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    price: 0.47,
    change24h: 1.2,
    volume24h: 480_000_000,
    marketCap: 16_800_000_000,
    color: COIN_COLORS.ADA,
    category: "altcoin",
  },
  {
    id: "avalanche",
    symbol: "AVAX",
    name: "Avalanche",
    price: 37.8,
    change24h: 6.1,
    volume24h: 820_000_000,
    marketCap: 15_600_000_000,
    color: COIN_COLORS.AVAX,
    category: "altcoin",
  },
  {
    id: "polygon",
    symbol: "MATIC",
    name: "Polygon",
    price: 0.88,
    change24h: -2.1,
    volume24h: 560_000_000,
    marketCap: 8_200_000_000,
    color: COIN_COLORS.MATIC,
    category: "altcoin",
  },
  {
    id: "polkadot",
    symbol: "DOT",
    name: "Polkadot",
    price: 8.72,
    change24h: 0.8,
    volume24h: 340_000_000,
    marketCap: 12_100_000_000,
    color: COIN_COLORS.DOT,
    category: "altcoin",
  },
  {
    id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    price: 17.5,
    change24h: 5.1,
    volume24h: 720_000_000,
    marketCap: 10_400_000_000,
    color: COIN_COLORS.LINK,
    category: "altcoin",
  },
  {
    id: "litecoin",
    symbol: "LTC",
    name: "Litecoin",
    price: 85.2,
    change24h: -1.8,
    volume24h: 680_000_000,
    marketCap: 6_300_000_000,
    color: COIN_COLORS.LTC,
    category: "altcoin",
  },
  {
    id: "uniswap",
    symbol: "UNI",
    name: "Uniswap",
    price: 10.4,
    change24h: 2.2,
    volume24h: 290_000_000,
    marketCap: 6_200_000_000,
    color: COIN_COLORS.UNI,
    category: "altcoin",
  },
  {
    id: "cosmos",
    symbol: "ATOM",
    name: "Cosmos",
    price: 8.95,
    change24h: -0.6,
    volume24h: 310_000_000,
    marketCap: 3_500_000_000,
    color: COIN_COLORS.ATOM,
    category: "altcoin",
  },
  {
    id: "near",
    symbol: "NEAR",
    name: "NEAR Protocol",
    price: 6.78,
    change24h: 3.4,
    volume24h: 420_000_000,
    marketCap: 7_400_000_000,
    color: COIN_COLORS.NEAR,
    category: "altcoin",
  },
  {
    id: "aptos",
    symbol: "APT",
    name: "Aptos",
    price: 12.45,
    change24h: 3.8,
    volume24h: 380_000_000,
    marketCap: 4_200_000_000,
    color: COIN_COLORS.APT,
    category: "altcoin",
  },
  {
    id: "arbitrum",
    symbol: "ARB",
    name: "Arbitrum",
    price: 1.82,
    change24h: 2.1,
    volume24h: 520_000_000,
    marketCap: 2_900_000_000,
    color: COIN_COLORS.ARB,
    category: "altcoin",
  },
  {
    id: "optimism",
    symbol: "OP",
    name: "Optimism",
    price: 2.95,
    change24h: -1.3,
    volume24h: 310_000_000,
    marketCap: 3_100_000_000,
    color: COIN_COLORS.OP,
    category: "altcoin",
  },
  {
    id: "sui",
    symbol: "SUI",
    name: "Sui",
    price: 1.15,
    change24h: 7.2,
    volume24h: 890_000_000,
    marketCap: 2_800_000_000,
    color: COIN_COLORS.SUI,
    category: "altcoin",
  },
  {
    id: "injective",
    symbol: "INJ",
    name: "Injective",
    price: 32.6,
    change24h: 5.4,
    volume24h: 470_000_000,
    marketCap: 3_400_000_000,
    color: COIN_COLORS.INJ,
    category: "altcoin",
  },

  // DIGITAL COINS (Stablecoins)
  {
    id: "tether",
    symbol: "USDT",
    name: "Tether",
    price: 1.0,
    change24h: 0.01,
    volume24h: 82_000_000_000,
    marketCap: 112_000_000_000,
    color: COIN_COLORS.USDT,
    category: "digitalCoin",
  },
  {
    id: "usd-coin",
    symbol: "USDC",
    name: "USD Coin",
    price: 1.0,
    change24h: 0.0,
    volume24h: 14_000_000_000,
    marketCap: 43_000_000_000,
    color: COIN_COLORS.USDC,
    category: "digitalCoin",
  },
  {
    id: "dai",
    symbol: "DAI",
    name: "Dai",
    price: 1.0,
    change24h: -0.02,
    volume24h: 2_100_000_000,
    marketCap: 5_200_000_000,
    color: COIN_COLORS.DAI,
    category: "digitalCoin",
  },
  {
    id: "trueusd",
    symbol: "TUSD",
    name: "TrueUSD",
    price: 1.0,
    change24h: 0.01,
    volume24h: 980_000_000,
    marketCap: 1_800_000_000,
    color: COIN_COLORS.TUSD,
    category: "digitalCoin",
  },

  // MEME COINS
  {
    id: "dogecoin",
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.165,
    change24h: -5.3,
    volume24h: 1_240_000_000,
    marketCap: 24_000_000_000,
    color: COIN_COLORS.DOGE,
    category: "memeCoin",
  },
  {
    id: "shiba-inu",
    symbol: "SHIB",
    name: "Shiba Inu",
    price: 0.0000248,
    change24h: 5.6,
    volume24h: 890_000_000,
    marketCap: 14_600_000_000,
    color: COIN_COLORS.SHIB,
    category: "memeCoin",
  },
  {
    id: "pepe",
    symbol: "PEPE",
    name: "Pepe",
    price: 0.00001385,
    change24h: 12.4,
    volume24h: 1_420_000_000,
    marketCap: 5_800_000_000,
    color: COIN_COLORS.PEPE,
    category: "memeCoin",
  },
  {
    id: "floki",
    symbol: "FLOKI",
    name: "FLOKI",
    price: 0.000198,
    change24h: 8.7,
    volume24h: 380_000_000,
    marketCap: 1_900_000_000,
    color: COIN_COLORS.FLOKI,
    category: "memeCoin",
  },
  {
    id: "dogwifhat",
    symbol: "WIF",
    name: "dogwifhat",
    price: 2.85,
    change24h: 9.3,
    volume24h: 760_000_000,
    marketCap: 2_850_000_000,
    color: COIN_COLORS.WIF,
    category: "memeCoin",
  },
  {
    id: "bonk",
    symbol: "BONK",
    name: "Bonk",
    price: 0.0000312,
    change24h: 11.2,
    volume24h: 520_000_000,
    marketCap: 2_100_000_000,
    color: COIN_COLORS.BONK,
    category: "memeCoin",
  },
  {
    id: "memecoin",
    symbol: "MEME",
    name: "Memecoin",
    price: 0.038,
    change24h: 6.8,
    volume24h: 180_000_000,
    marketCap: 380_000_000,
    color: COIN_COLORS.MEME,
    category: "memeCoin",
  },
  {
    id: "turbo",
    symbol: "TURBO",
    name: "Turbo",
    price: 0.006,
    change24h: 14.2,
    volume24h: 95_000_000,
    marketCap: 240_000_000,
    color: COIN_COLORS.TURBO,
    category: "memeCoin",
  },
];

// Generate realistic 7-day sparkline data based on current price and trend
function generateSparkline(price: number, change24h: number): number[] {
  const points = 7;
  const data: number[] = [];
  let p = price;
  for (let i = points - 1; i >= 0; i--) {
    data.unshift(p);
    const dailyTrend =
      -(change24h / 100) * price * (1 / 7) * (0.5 + Math.random() * 0.5);
    const noise = price * 0.015 * (Math.random() - 0.5);
    p = Math.max(p + dailyTrend + noise, price * 0.8);
  }
  return data;
}

// Compute AI recommendation from price change
export function computeSignal(coin: Coin): AISignal {
  let recommendation: Recommendation;
  let confidence: number;
  let reasoning: string;

  if (coin.change24h > 3) {
    recommendation = "BUY";
    confidence = Math.round(
      80 + Math.min(coin.change24h - 3, 7) * 1.4 + Math.random() * 4,
    );
    reasoning =
      BUY_REASONS[coin.symbol] ??
      "Strong upward momentum detected. Technical indicators confirm bullish trend continuation.";
  } else if (coin.change24h < -3) {
    recommendation = "SELL";
    confidence = Math.round(
      70 + Math.min(Math.abs(coin.change24h) - 3, 8) * 1.8 + Math.random() * 4,
    );
    reasoning =
      SELL_REASONS[coin.symbol] ??
      "Bearish momentum accelerating. Risk management protocols suggest reducing exposure.";
  } else {
    recommendation = "HOLD";
    confidence = Math.round(60 + Math.random() * 10);
    reasoning =
      HOLD_REASONS[coin.symbol] ??
      "Market consolidating. Neutral momentum — maintain current positions and monitor key levels.";
  }

  return {
    coinSymbol: coin.symbol,
    coinName: coin.name,
    recommendation,
    confidence: Math.min(confidence, 98),
    reasoning,
    timestamp: Date.now(),
  };
}

// Initialize coins with sparklines
export function initializeCoins(): Coin[] {
  return SEED_COINS.map((c) => ({
    ...c,
    sparkline: generateSparkline(c.price, c.change24h),
  }));
}

// Apply price fluctuations (±0.5%) and re-generate sparklines
export function fluctuatePrices(coins: Coin[]): Coin[] {
  return coins.map((coin) => {
    const fluctuation = 1 + (Math.random() - 0.5) * 0.01;
    const newPrice = coin.price * fluctuation;
    const priceChange = (newPrice - coin.price) / coin.price;
    const newChange =
      coin.change24h + priceChange * 100 * 0.3 + (Math.random() - 0.5) * 0.05;
    const newSparkline = [...coin.sparkline.slice(1), newPrice];
    return {
      ...coin,
      price: newPrice,
      change24h: newChange,
      sparkline: newSparkline,
    };
  });
}

// Format price nicely
export function formatPrice(price: number): string {
  if (price >= 1000) {
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  if (price >= 0.0001) return `$${price.toFixed(6)}`;
  return `$${price.toFixed(8)}`;
}

// Format large numbers (market cap, volume)
export function formatLargeNumber(n: number): string {
  if (n >= 1_000_000_000_000) return `$${(n / 1_000_000_000_000).toFixed(2)}T`;
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

export { COIN_COLORS };
