import {
  Brain,
  Minus,
  Star,
  StarOff,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  type AISignal,
  type Coin,
  type Recommendation,
  formatLargeNumber,
  formatPrice,
} from "../data/cryptoData";
import { CoinLogo } from "./CoinLogo";
import { LiveChart } from "./LiveChart";

interface CoinDetailModalProps {
  coin: Coin;
  signal: AISignal;
  isWatchlisted: boolean;
  onClose: () => void;
  onToggleWatchlist: (symbol: string) => void;
}

const SIG: Record<
  Recommendation,
  { label: string; color: string; bg: string }
> = {
  BUY: {
    label: "BUY",
    color: "oklch(0.72 0.18 155)",
    bg: "oklch(0.72 0.18 155 / 0.15)",
  },
  SELL: {
    label: "SELL",
    color: "oklch(0.65 0.22 25)",
    bg: "oklch(0.65 0.22 25 / 0.15)",
  },
  HOLD: {
    label: "HOLD",
    color: "oklch(0.82 0.16 88)",
    bg: "oklch(0.82 0.16 88 / 0.15)",
  },
};

export function CoinDetailModal({
  coin,
  signal,
  isWatchlisted,
  onClose,
  onToggleWatchlist,
}: CoinDetailModalProps) {
  const isPositive = coin.change24h >= 0;
  const sig = SIG[signal.recommendation];
  const changeColor = isPositive
    ? "oklch(0.72 0.18 155)"
    : "oklch(0.65 0.22 25)";

  const handleBuy = () =>
    toast.success(`Buy order for ${coin.symbol} submitted`, {
      description: "Mock trade placed successfully",
    });
  const handleSell = () =>
    toast.error(`Sell order for ${coin.symbol} submitted`, {
      description: "Mock trade placed successfully",
    });

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{
          background: "oklch(0 0 0 / 0.75)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ type: "spring", damping: 30, stiffness: 350 }}
        className="fixed inset-4 md:inset-8 lg:inset-12 z-50 rounded-lg overflow-hidden flex flex-col"
        style={{
          background: "oklch(0.12 0.007 240)",
          border: "1px solid oklch(0.22 0.010 240)",
          boxShadow: "0 24px 80px oklch(0 0 0 / 0.7)",
          maxWidth: "1100px",
          maxHeight: "90vh",
          margin: "auto",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-3.5 shrink-0"
          style={{ borderBottom: "1px solid oklch(0.20 0.010 240)" }}
        >
          <CoinLogo symbol={coin.symbol} color={coin.color} size={36} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base text-foreground">
                {coin.name}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {coin.symbol}/USDT
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xl font-bold font-mono text-foreground">
                {formatPrice(coin.price)}
              </span>
              <span
                className="text-sm font-mono font-semibold"
                style={{ color: changeColor }}
              >
                {isPositive ? "+" : ""}
                {coin.change24h.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleWatchlist(coin.symbol)}
              className="p-2 rounded transition-colors hover:bg-accent/50"
            >
              {isWatchlisted ? (
                <Star className="w-4 h-4 fill-binance-yellow text-binance-yellow" />
              ) : (
                <StarOff className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded transition-colors hover:bg-accent/50 text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-[1fr_300px] h-full">
            {/* Left: chart */}
            <div
              className="p-4 lg:p-5"
              style={{ borderRight: "1px solid oklch(0.20 0.010 240)" }}
            >
              <LiveChart
                basePrice={coin.price}
                symbol={coin.symbol}
                isPositive={isPositive}
                height={300}
                updateInterval={5000}
              />

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {[
                  {
                    label: "Market Cap",
                    value: formatLargeNumber(coin.marketCap),
                  },
                  {
                    label: "24h Volume",
                    value: formatLargeNumber(coin.volume24h),
                  },
                  {
                    label: "24h High",
                    value: formatPrice(
                      coin.price * (1 + Math.abs(coin.change24h) * 0.008),
                    ),
                  },
                  {
                    label: "24h Low",
                    value: formatPrice(
                      coin.price * (1 - Math.abs(coin.change24h) * 0.008),
                    ),
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded p-3"
                    style={{
                      background: "oklch(0.155 0.008 235)",
                      border: "1px solid oklch(0.22 0.010 240)",
                    }}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      {label}
                    </div>
                    <div className="font-mono font-semibold text-sm text-foreground">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: AI signal + trade */}
            <div className="p-4 lg:p-5 flex flex-col gap-4">
              {/* AI Signal */}
              <div
                className="rounded-lg p-4"
                style={{
                  background: "oklch(0.155 0.008 235)",
                  border: `1px solid ${sig.color}40`,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Brain
                    className="w-4 h-4"
                    style={{ color: "oklch(0.82 0.16 88)" }}
                  />
                  <span
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "oklch(0.82 0.16 88)" }}
                  >
                    AI Signal
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded text-base font-bold font-mono"
                    style={{
                      background: sig.bg,
                      border: `1px solid ${sig.color}50`,
                      color: sig.color,
                    }}
                  >
                    {signal.recommendation === "BUY" && (
                      <TrendingUp className="w-4 h-4" />
                    )}
                    {signal.recommendation === "SELL" && (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {signal.recommendation === "HOLD" && (
                      <Minus className="w-4 h-4" />
                    )}
                    {sig.label}
                  </div>
                  <div className="text-right">
                    <div
                      className="text-xl font-bold font-mono"
                      style={{ color: sig.color }}
                    >
                      {signal.confidence}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      confidence
                    </div>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="mb-3">
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "oklch(0.22 0.010 240)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${signal.confidence}%`,
                        background: sig.color,
                      }}
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {signal.reasoning}
                </p>
              </div>

              {/* Quick Trade */}
              <div
                className="rounded-lg p-4"
                style={{
                  background: "oklch(0.155 0.008 235)",
                  border: "1px solid oklch(0.22 0.010 240)",
                }}
              >
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Quick Trade
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleBuy}
                    className="py-2.5 rounded text-sm font-bold font-mono transition-all active:scale-95"
                    style={{
                      background: "oklch(0.72 0.18 155 / 0.15)",
                      border: "1px solid oklch(0.72 0.18 155 / 0.5)",
                      color: "oklch(0.72 0.18 155)",
                    }}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    onClick={handleSell}
                    className="py-2.5 rounded text-sm font-bold font-mono transition-all active:scale-95"
                    style={{
                      background: "oklch(0.65 0.22 25 / 0.15)",
                      border: "1px solid oklch(0.65 0.22 25 / 0.5)",
                      color: "oklch(0.65 0.22 25)",
                    }}
                  >
                    SELL
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Demo mode — no real trades executed
                </p>
              </div>

              {/* Watchlist toggle */}
              <button
                type="button"
                onClick={() => onToggleWatchlist(coin.symbol)}
                className="w-full py-2.5 rounded text-sm font-semibold font-mono transition-all"
                style={
                  isWatchlisted
                    ? {
                        background: "oklch(0.20 0.010 240)",
                        border: "1px solid oklch(0.28 0.012 240)",
                        color: "oklch(0.55 0.012 225)",
                      }
                    : {
                        background: "oklch(0.82 0.16 88 / 0.1)",
                        border: "1px solid oklch(0.82 0.16 88 / 0.4)",
                        color: "oklch(0.82 0.16 88)",
                      }
                }
              >
                {isWatchlisted ? (
                  <>
                    <StarOff className="w-3.5 h-3.5 inline mr-1.5" />
                    Remove Watchlist
                  </>
                ) : (
                  <>
                    <Star className="w-3.5 h-3.5 inline mr-1.5" />
                    Add to Watchlist
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
