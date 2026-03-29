import { Minus, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { AISignal, Recommendation } from "../data/cryptoData";

interface AISignalFeedProps {
  signals: AISignal[];
}

const SIGNAL_STYLES: Record<
  Recommendation,
  {
    icon: typeof TrendingUp;
    textClass: string;
    bgClass: string;
    borderClass: string;
  }
> = {
  BUY: {
    icon: TrendingUp,
    textClass: "text-terminal-green",
    bgClass: "bg-signal-buy",
    borderClass: "border-signal-buy",
  },
  SELL: {
    icon: TrendingDown,
    textClass: "text-terminal-red",
    bgClass: "bg-signal-sell",
    borderClass: "border-signal-sell",
  },
  HOLD: {
    icon: Minus,
    textClass: "text-terminal-amber",
    bgClass: "bg-signal-hold",
    borderClass: "border-signal-hold",
  },
};

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export function AISignalFeed({ signals }: AISignalFeedProps) {
  const displaySignals = signals.slice(0, 20);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: "1px solid oklch(0.22 0.012 240)" }}
      >
        <Zap className="w-4 h-4 text-terminal-cyan" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-terminal-cyan">
          Live AI Signals
        </h2>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-terminal-green animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono">LIVE</span>
        </div>
      </div>

      {/* Feed list */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          {displaySignals.map((signal) => {
            const style = SIGNAL_STYLES[signal.recommendation];
            const Icon = style.icon;
            return (
              <motion.div
                key={`${signal.coinSymbol}-${signal.timestamp}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-start gap-3 px-4 py-3 hover:bg-accent/30 transition-colors"
                style={{ borderBottom: "1px solid oklch(0.18 0.01 235)" }}
              >
                {/* Signal icon */}
                <div
                  className={`mt-0.5 p-1.5 rounded-md shrink-0 ${style.bgClass} ${style.borderClass} border`}
                >
                  <Icon className={`w-3 h-3 ${style.textClass}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-bold font-mono text-foreground">
                      {signal.coinSymbol}
                    </span>
                    <span
                      className={`text-xs font-bold font-mono ${style.textClass}`}
                    >
                      {signal.recommendation}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono ml-auto shrink-0">
                      {signal.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {signal.reasoning}
                  </p>
                  <div className="text-[10px] text-muted-foreground/70 font-mono mt-1">
                    {timeAgo(signal.timestamp)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
