import { Progress } from "@/components/ui/progress";
import {
  Activity,
  BarChart3,
  Brain,
  DollarSign,
  Minus,
  Star,
  StarOff,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  type AISignal,
  type Coin,
  type Recommendation,
  formatLargeNumber,
  formatPrice,
} from "../data/cryptoData";
import { CoinLogo } from "./CoinLogo";

interface CoinDetailSheetProps {
  coin: Coin | null;
  signal: AISignal | null;
  isWatchlisted: boolean;
  onClose: () => void;
  onToggleWatchlist: (symbol: string) => void;
}

const SIGNAL_CONFIG: Record<
  Recommendation,
  {
    label: string;
    textClass: string;
    bgClass: string;
    borderClass: string;
    glowStyle: string;
  }
> = {
  BUY: {
    label: "BUY",
    textClass: "text-terminal-green",
    bgClass: "bg-signal-buy",
    borderClass: "border-signal-buy",
    glowStyle: "0 0 20px oklch(0.72 0.18 155 / 0.3)",
  },
  SELL: {
    label: "SELL",
    textClass: "text-terminal-red",
    bgClass: "bg-signal-sell",
    borderClass: "border-signal-sell",
    glowStyle: "0 0 20px oklch(0.62 0.22 25 / 0.3)",
  },
  HOLD: {
    label: "HOLD",
    textClass: "text-terminal-amber",
    bgClass: "bg-signal-hold",
    borderClass: "border-signal-hold",
    glowStyle: "0 0 20px oklch(0.78 0.16 75 / 0.3)",
  },
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Custom recharts tooltip
function CustomTooltip({
  active,
  payload,
}: { active?: boolean; payload?: Array<{ value: number }> }) {
  if (active && payload?.length) {
    return (
      <div
        className="px-2.5 py-1.5 rounded text-xs font-mono"
        style={{
          background: "oklch(0.18 0.012 235)",
          border: "1px solid oklch(0.28 0.015 240)",
        }}
      >
        <span className="text-terminal-cyan">
          {formatPrice(payload[0].value)}
        </span>
      </div>
    );
  }
  return null;
}

export function CoinDetailSheet({
  coin,
  signal,
  isWatchlisted,
  onClose,
  onToggleWatchlist,
}: CoinDetailSheetProps) {
  if (!coin || !signal) return null;

  const sigConfig = SIGNAL_CONFIG[signal.recommendation];
  const isPositive = coin.change24h >= 0;

  const chartData = coin.sparkline.map((v, i) => ({
    day: DAY_LABELS[i] ?? `D${i + 1}`,
    price: v,
  }));

  const lineColor =
    signal.recommendation === "BUY"
      ? "oklch(0.72 0.18 155)"
      : signal.recommendation === "SELL"
        ? "oklch(0.65 0.22 25)"
        : "oklch(0.82 0.18 75)";

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{
          background: "oklch(0 0 0 / 0.7)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        key="sheet"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md overflow-y-auto"
        style={{
          background: "oklch(0.125 0.009 240)",
          borderLeft: "1px solid oklch(0.25 0.015 240)",
          boxShadow: "-8px 0 40px oklch(0 0 0 / 0.5)",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
          style={{
            background: "oklch(0.125 0.009 240)",
            borderBottom: "1px solid oklch(0.22 0.012 240)",
          }}
        >
          <div className="flex items-center gap-3">
            <CoinLogo symbol={coin.symbol} color={coin.color} size={40} />
            <div>
              <h2 className="font-bold text-base font-display text-foreground">
                {coin.name}
              </h2>
              <span className="text-xs text-muted-foreground font-mono">
                {coin.symbol}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleWatchlist(coin.symbol)}
              className="p-2 rounded-md transition-colors hover:bg-accent/50"
              aria-label={
                isWatchlisted ? "Remove from watchlist" : "Add to watchlist"
              }
            >
              {isWatchlisted ? (
                <Star className="w-4 h-4 fill-terminal-amber text-terminal-amber" />
              ) : (
                <StarOff className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-md transition-colors hover:bg-accent/50 text-muted-foreground"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-5 py-5 space-y-6">
          {/* Price block */}
          <div>
            <div className="text-3xl font-bold font-mono text-foreground">
              {formatPrice(coin.price)}
            </div>
            <div
              className={`flex items-center gap-1.5 mt-1 text-sm font-mono font-medium ${isPositive ? "text-terminal-green" : "text-terminal-red"}`}
            >
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {isPositive ? "+" : ""}
              {coin.change24h.toFixed(2)}% (24h)
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: BarChart3,
                label: "Market Cap",
                value: formatLargeNumber(coin.marketCap),
              },
              {
                icon: Activity,
                label: "24h Volume",
                value: formatLargeNumber(coin.volume24h),
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-lg p-3"
                style={{
                  background: "oklch(0.16 0.012 235)",
                  border: "1px solid oklch(0.22 0.012 240)",
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
                <div className="font-mono font-semibold text-sm text-foreground">
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              7-Day Price History
            </h3>
            <div
              className="h-44 rounded-lg overflow-hidden p-3"
              style={{
                background: "oklch(0.16 0.012 235)",
                border: "1px solid oklch(0.22 0.012 240)",
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.22 0.012 240)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{
                      fill: "oklch(0.58 0.015 225)",
                      fontSize: 10,
                      fontFamily: "JetBrains Mono",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fill: "oklch(0.58 0.015 225)",
                      fontSize: 10,
                      fontFamily: "JetBrains Mono",
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                    tickFormatter={(v) => formatPrice(v).replace("$", "$")}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke={lineColor}
                    strokeWidth={2}
                    dot={{ fill: lineColor, r: 3, strokeWidth: 0 }}
                    activeDot={{
                      fill: lineColor,
                      r: 5,
                      strokeWidth: 2,
                      stroke: "oklch(0.125 0.009 240)",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Recommendation */}
          <div
            className="rounded-lg p-4"
            style={{
              background: "oklch(0.16 0.012 235)",
              border: `1px solid ${sigConfig.borderClass.replace("border-", "")}`,
              boxShadow: sigConfig.glowStyle,
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-terminal-cyan" />
              <h3 className="text-xs font-semibold text-terminal-cyan uppercase tracking-widest">
                AI Recommendation
              </h3>
            </div>

            {/* Big signal badge */}
            <div className="flex items-center justify-between mb-4">
              <div
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-lg font-bold font-mono border ${sigConfig.bgClass} ${sigConfig.borderClass} ${sigConfig.textClass}`}
                style={{ boxShadow: sigConfig.glowStyle }}
              >
                {signal.recommendation === "BUY" && (
                  <TrendingUp className="w-5 h-5" />
                )}
                {signal.recommendation === "SELL" && (
                  <TrendingDown className="w-5 h-5" />
                )}
                {signal.recommendation === "HOLD" && (
                  <Minus className="w-5 h-5" />
                )}
                {sigConfig.label}
              </div>

              <div className="text-right">
                <div
                  className="text-2xl font-bold font-mono"
                  style={{ color: lineColor }}
                >
                  {signal.confidence}%
                </div>
                <div className="text-xs text-muted-foreground">confidence</div>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Signal Strength</span>
                <span className={sigConfig.textClass}>
                  {signal.confidence}%
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: "oklch(0.22 0.012 240)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${signal.confidence}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ background: lineColor }}
                />
              </div>
            </div>

            {/* Reasoning */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {signal.reasoning}
            </p>
          </div>

          {/* Watchlist button */}
          <button
            type="button"
            onClick={() => onToggleWatchlist(coin.symbol)}
            className="w-full py-3 px-4 rounded-lg text-sm font-semibold font-mono transition-all duration-200 flex items-center justify-center gap-2"
            style={
              isWatchlisted
                ? {
                    background: "oklch(0.22 0.012 240)",
                    border: "1px solid oklch(0.28 0.015 240)",
                    color: "oklch(0.58 0.015 225)",
                  }
                : {
                    background: "oklch(0.78 0.18 174 / 0.12)",
                    border: "1px solid oklch(0.78 0.18 174 / 0.4)",
                    color: "oklch(0.78 0.18 174)",
                  }
            }
          >
            {isWatchlisted ? (
              <>
                <StarOff className="w-4 h-4" /> Remove from Watchlist
              </>
            ) : (
              <>
                <Star className="w-4 h-4" /> Add to Watchlist
              </>
            )}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
