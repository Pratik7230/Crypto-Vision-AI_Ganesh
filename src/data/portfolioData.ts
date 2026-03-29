export interface Position {
  symbol: string;
  name: string;
  side: "LONG" | "SHORT";
  quantity: number;
  entryPrice: number;
  color: string;
}

export interface WalletBalance {
  symbol: string;
  name: string;
  amount: number;
  color: string;
}

export const INITIAL_POSITIONS: Position[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    side: "LONG",
    quantity: 0.5,
    entryPrice: 60000,
    color: "#f7931a",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    side: "LONG",
    quantity: 2.0,
    entryPrice: 3200,
    color: "#627eea",
  },
  {
    symbol: "SOL",
    name: "Solana",
    side: "LONG",
    quantity: 25,
    entryPrice: 150,
    color: "#9945ff",
  },
  {
    symbol: "ADA",
    name: "Cardano",
    side: "LONG",
    quantity: 500,
    entryPrice: 0.38,
    color: "#0033ad",
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    side: "SHORT",
    quantity: 1000,
    entryPrice: 0.2,
    color: "#c3a634",
  },
];

export const INITIAL_WALLET: WalletBalance[] = [
  { symbol: "USDT", name: "Tether", amount: 10000, color: "#26a17b" },
  { symbol: "BTC", name: "Bitcoin", amount: 0.5, color: "#f7931a" },
  { symbol: "ETH", name: "Ethereum", amount: 2.0, color: "#627eea" },
  { symbol: "SOL", name: "Solana", amount: 25.0, color: "#9945ff" },
  { symbol: "ADA", name: "Cardano", amount: 500, color: "#0033ad" },
  { symbol: "BNB", name: "BNB", amount: 1.5, color: "#f3ba2f" },
];

// Generate 30-day performance data
export function generatePerformanceData(): { date: string; value: number }[] {
  const data: { date: string; value: number }[] = [];
  let value = 42000;
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const change = (Math.random() - 0.45) * 800;
    value = Math.max(value + change, 30000);
    data.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.round(value),
    });
  }
  return data;
}
