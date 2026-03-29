import { Minus, Star, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import {
  type AISignal,
  type Coin,
  type Recommendation,
  formatPrice,
} from "../data/cryptoData";
import { CoinLogo } from "./CoinLogo";

interface WatchlistProps {
  coins: Coin[];
  signals: Map<string, AISignal>;
  watchlistSymbols: Set<string>;
  onCoinClick: (coin: Coin) => void;
  onToggleWatchlist: (symbol: string) => void;
}

const SIGNAL_CONFIG: Record<
  Recommendation,
  { label: string; textClass: string; bgClass: string; borderClass: string }
> = {
  BUY: {
    label: "BUY",
    textClass: "text-terminal-green",
    bgClass: "bg-signal-buy",
    borderClass: "border-signal-buy",
  },
  SELL: {
    label: "SELL",
    textClass: "text-terminal-red",
    bgClass: "bg-signal-sell",
    borderClass: "border-signal-sell",
  },
  HOLD: {
    label: "HOLD",
    textClass: "text-terminal-amber",
    bgClass: "bg-signal-hold",
    borderClass: "border-signal-hold",
  },
};

export function Watchlist({
  coins,
  signals,
  watchlistSymbols,
  onCoinClick,
  onToggleWatchlist,
}: WatchlistProps) {
  const watchlistCoins = coins.filter((c) => watchlistSymbols.has(c.symbol));

  if (watchlistCoins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-8">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{
            background: "oklch(0.16 0.012 235)",
            border: "1px solid oklch(0.22 0.012 240)",
          }}
        >
          <Star className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="font-semibold font-display text-foreground mb-2">
          No coins in watchlist
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Click the star icon on any coin card to add it to your watchlist for
          quick monitoring.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {watchlistCoins.map((coin, i) => {
        const signal = signals.get(coin.symbol);
        if (!signal) return null;
        const sigConfig = SIGNAL_CONFIG[signal.recommendation];
        const isPositive = coin.change24h >= 0;

        return (
          <motion.div
            key={coin.symbol}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            onClick={() => onCoinClick(coin)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer group transition-colors"
            style={{
              background: "oklch(0.14 0.01 235)",
              border: "1px solid oklch(0.22 0.012 240)",
            }}
          >
            {/* Avatar */}
            <CoinLogo symbol={coin.symbol} color={coin.color} size={36} />

            {/* Name + Symbol */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm font-mono text-foreground">
                {coin.symbol}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {coin.name}
              </div>
            </div>

            {/* Price + change */}
            <div className="text-right mr-2">
              <div className="font-mono font-semibold text-sm text-foreground">
                {formatPrice(coin.price)}
              </div>
              <div
                className={`flex items-center justify-end gap-0.5 text-xs font-mono ${isPositive ? "text-terminal-green" : "text-terminal-red"}`}
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

            {/* Signal */}
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold font-mono border shrink-0 ${sigConfig.bgClass} ${sigConfig.borderClass} ${sigConfig.textClass}`}
            >
              {signal.recommendation === "BUY" && (
                <TrendingUp className="w-3 h-3" />
              )}
              {signal.recommendation === "SELL" && (
                <TrendingDown className="w-3 h-3" />
              )}
              {signal.recommendation === "HOLD" && (
                <Minus className="w-3 h-3" />
              )}
              {sigConfig.label}
            </div>

            {/* Remove star */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatchlist(coin.symbol);
              }}
              className="p-1 rounded transition-colors hover:bg-accent/50 shrink-0"
              aria-label="Remove from watchlist"
            >
              <Star className="w-3.5 h-3.5 fill-terminal-amber text-terminal-amber" />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
