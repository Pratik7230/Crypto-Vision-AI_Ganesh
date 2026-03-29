import { Minus, Star, StarOff, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import {
  type AISignal,
  type Coin,
  type Recommendation,
  formatPrice,
} from "../data/cryptoData";
import { CoinLogo } from "./CoinLogo";

interface CoinCardProps {
  coin: Coin;
  signal: AISignal;
  isWatchlisted: boolean;
  onToggleWatchlist: (symbol: string) => void;
  onClick: (coin: Coin) => void;
  index: number;
}

const SIGNAL_CONFIG: Record<
  Recommendation,
  { label: string; className: string; bgClass: string; borderClass: string }
> = {
  BUY: {
    label: "BUY",
    className: "text-signal-buy",
    bgClass: "bg-signal-buy",
    borderClass: "border-signal-buy",
  },
  SELL: {
    label: "SELL",
    className: "text-signal-sell",
    bgClass: "bg-signal-sell",
    borderClass: "border-signal-sell",
  },
  HOLD: {
    label: "HOLD",
    className: "text-signal-hold",
    bgClass: "bg-signal-hold",
    borderClass: "border-signal-hold",
  },
};

export function CoinCard({
  coin,
  signal,
  isWatchlisted,
  onToggleWatchlist,
  onClick,
  index,
}: CoinCardProps) {
  const sigConfig = SIGNAL_CONFIG[signal.recommendation];
  const isPositive = coin.change24h >= 0;
  const sparkData = coin.sparkline.map((v, i) => ({ i, v }));
  const sparkColor =
    signal.recommendation === "BUY"
      ? "#4ade80"
      : signal.recommendation === "SELL"
        ? "#f87171"
        : "#fbbf24";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      onClick={() => onClick(coin)}
      className="relative rounded-lg cursor-pointer group overflow-hidden"
      style={{
        background: "oklch(0.14 0.01 235)",
        border: "1px solid oklch(0.22 0.012 240)",
        boxShadow:
          "0 2px 8px oklch(0 0 0 / 0.4), inset 0 1px 0 oklch(1 0 0 / 0.04)",
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg"
        style={{
          background: `linear-gradient(135deg, ${coin.color}08 0%, transparent 70%)`,
        }}
      />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {/* Coin avatar */}
            <CoinLogo symbol={coin.symbol} color={coin.color} size={36} />
            <div>
              <div className="font-semibold text-sm text-foreground font-mono">
                {coin.symbol}
              </div>
              <div className="text-xs text-muted-foreground truncate max-w-[80px]">
                {coin.name}
              </div>
            </div>
          </div>

          {/* Watchlist star */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(coin.symbol);
            }}
            className="p-1 rounded transition-colors hover:bg-accent/50 text-muted-foreground hover:text-terminal-amber"
            aria-label={
              isWatchlisted ? "Remove from watchlist" : "Add to watchlist"
            }
          >
            {isWatchlisted ? (
              <Star className="w-3.5 h-3.5 fill-terminal-amber text-terminal-amber" />
            ) : (
              <StarOff className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Price */}
        <div className="mb-2">
          <div className="text-lg font-bold font-mono text-foreground leading-none">
            {formatPrice(coin.price)}
          </div>
          <div
            className={`flex items-center gap-1 mt-1 text-xs font-mono font-medium ${isPositive ? "text-terminal-green" : "text-terminal-red"}`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {isPositive ? "+" : ""}
            {coin.change24h.toFixed(2)}%
          </div>
        </div>

        {/* Mini sparkline */}
        <div className="h-10 mb-3 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={sparkColor}
                strokeWidth={1.5}
                dot={false}
                strokeOpacity={0.8}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Signal row */}
        <div className="flex items-center justify-between">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold font-mono border ${sigConfig.bgClass} ${sigConfig.borderClass} ${sigConfig.className}`}
          >
            {signal.recommendation === "BUY" && (
              <TrendingUp className="w-3 h-3" />
            )}
            {signal.recommendation === "SELL" && (
              <TrendingDown className="w-3 h-3" />
            )}
            {signal.recommendation === "HOLD" && <Minus className="w-3 h-3" />}
            {sigConfig.label}
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Confidence</div>
            <div
              className={`text-xs font-bold font-mono ${sigConfig.className}`}
            >
              {signal.confidence}%
            </div>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mt-2 h-1 rounded-full bg-accent/50 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${sigConfig.bgClass}`}
            initial={{ width: 0 }}
            animate={{ width: `${signal.confidence}%` }}
            transition={{ duration: 0.6, delay: index * 0.04 + 0.2 }}
            style={{
              background:
                signal.recommendation === "BUY"
                  ? "oklch(0.72 0.18 155)"
                  : signal.recommendation === "SELL"
                    ? "oklch(0.65 0.22 25)"
                    : "oklch(0.82 0.18 75)",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
