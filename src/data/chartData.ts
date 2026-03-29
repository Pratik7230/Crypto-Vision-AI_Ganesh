export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Generate realistic OHLCV candles
export function generateCandles(
  basePrice: number,
  count: number,
  intervalMinutes: number,
  volatility = 0.012,
): Candle[] {
  const candles: Candle[] = [];
  let price = basePrice;
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const t = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
    const open = price;
    const change = (Math.random() - 0.48) * volatility * price;
    const close = Math.max(open + change, open * 0.97);
    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
    const volume = basePrice * (0.5 + Math.random() * 2) * 1000;

    candles.push({
      time: t.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      open: Number.parseFloat(open.toFixed(8)),
      high: Number.parseFloat(high.toFixed(8)),
      low: Number.parseFloat(low.toFixed(8)),
      close: Number.parseFloat(close.toFixed(8)),
      volume: Math.round(volume),
    });

    price = close;
  }

  return candles;
}

// Get candle interval in minutes for timeframe
export function getTimeframeInterval(tf: string): number {
  switch (tf) {
    case "1m":
      return 1;
    case "5m":
      return 5;
    case "15m":
      return 15;
    case "1H":
      return 60;
    case "4H":
      return 240;
    case "1D":
      return 1440;
    default:
      return 60;
  }
}

// Get candle count for timeframe
export function getTimeframeCount(tf: string): number {
  switch (tf) {
    case "1m":
      return 60;
    case "5m":
      return 72;
    case "15m":
      return 96;
    case "1H":
      return 100;
    case "4H":
      return 84;
    case "1D":
      return 90;
    default:
      return 100;
  }
}
