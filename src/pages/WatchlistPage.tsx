import { Brain, Minus, Star, TrendingDown, TrendingUp } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { CoinDetailModal } from "../components/CoinDetailModal";
import { CoinLogo } from "../components/CoinLogo";
import { SparklineCell } from "../components/SparklineCell";
import { type Coin, formatLargeNumber, formatPrice } from "../data/cryptoData";
import type { Recommendation } from "../data/cryptoData";
import { useAppStore } from "../store/appStore";

const SIG_STYLE: Record<Recommendation, { color: string; bg: string }> = {
  BUY: { color: "oklch(0.72 0.18 155)", bg: "oklch(0.72 0.18 155 / 0.15)" },
  SELL: { color: "oklch(0.65 0.22 25)", bg: "oklch(0.65 0.22 25 / 0.15)" },
  HOLD: { color: "oklch(0.82 0.16 88)", bg: "oklch(0.82 0.16 88 / 0.15)" },
};

export function WatchlistPage() {
  const coins = useAppStore((s) => s.coins);
  const signals = useAppStore((s) => s.signals);
  const watchlist = useAppStore((s) => s.watchlist);
  const toggleWatchlist = useAppStore((s) => s.toggleWatchlist);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);

  const watchedCoins = coins.filter((c) => watchlist.has(c.symbol));
  const liveCoin = selectedCoin
    ? (coins.find((c) => c.symbol === selectedCoin.symbol) ?? selectedCoin)
    : null;
  const selectedSignal = selectedCoin
    ? (signals.get(selectedCoin.symbol) ?? null)
    : null;

  const handleToggle = (symbol: string) => {
    toggleWatchlist(symbol);
    toast(`${symbol} removed from watchlist`, { duration: 2000 });
  };

  if (watchedCoins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <Star
          className="w-16 h-16 mb-4 opacity-20"
          style={{ color: "oklch(0.82 0.16 88)" }}
        />
        <h2 className="font-display font-bold text-xl text-foreground mb-2">
          Watchlist is empty
        </h2>
        <p className="text-muted-foreground text-sm font-mono">
          Add coins from the Markets page by clicking the ★ icon.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{ borderBottom: "1px solid oklch(0.20 0.010 240)" }}
      >
        <h1 className="font-display font-bold text-base text-foreground">
          Watchlist
        </h1>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold"
          style={{
            background: "oklch(0.82 0.16 88 / 0.15)",
            color: "oklch(0.82 0.16 88)",
          }}
        >
          {watchedCoins.length}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <table className="w-full hidden md:table">
          <thead className="sticky top-0 z-10">
            <tr
              style={{
                background: "oklch(0.13 0.007 240)",
                borderBottom: "1px solid oklch(0.20 0.010 240)",
              }}
            >
              {[
                "Name",
                "Price",
                "24h %",
                "Volume",
                "Market Cap",
                "7D",
                "Signal",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 text-left text-[11px] font-mono font-medium text-muted-foreground first:pl-4"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {watchedCoins.map((coin) => {
              const signal = signals.get(coin.symbol);
              const isUp = coin.change24h >= 0;
              const sig = signal ? SIG_STYLE[signal.recommendation] : null;
              return (
                <tr
                  key={coin.symbol}
                  className="exchange-row cursor-pointer"
                  style={{ borderBottom: "1px solid oklch(0.18 0.008 235)" }}
                  onClick={() => setSelectedCoin(coin)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setSelectedCoin(coin);
                  }}
                >
                  <td className="pl-4 pr-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <CoinLogo
                        symbol={coin.symbol}
                        color={coin.color}
                        size={28}
                      />
                      <div>
                        <div className="text-xs font-semibold text-foreground">
                          {coin.symbol}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {coin.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-sm font-semibold text-foreground">
                    {formatPrice(coin.price)}
                  </td>
                  <td
                    className="px-3 py-2.5 font-mono text-sm font-semibold"
                    style={{
                      color: isUp
                        ? "oklch(0.72 0.18 155)"
                        : "oklch(0.65 0.22 25)",
                    }}
                  >
                    {isUp ? "+" : ""}
                    {coin.change24h.toFixed(2)}%
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                    {formatLargeNumber(coin.volume24h)}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                    {formatLargeNumber(coin.marketCap)}
                  </td>
                  <td className="px-3 py-2.5">
                    <SparklineCell data={coin.sparkline} isPositive={isUp} />
                  </td>
                  <td className="px-3 py-2.5">
                    {signal && sig && (
                      <div className="flex items-center gap-1">
                        <Brain className="w-3 h-3 text-muted-foreground" />
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono"
                          style={{
                            background: sig.bg,
                            color: sig.color,
                            border: `1px solid ${sig.color}40`,
                          }}
                        >
                          {signal.recommendation === "BUY" && (
                            <TrendingUp className="w-2.5 h-2.5" />
                          )}
                          {signal.recommendation === "SELL" && (
                            <TrendingDown className="w-2.5 h-2.5" />
                          )}
                          {signal.recommendation === "HOLD" && (
                            <Minus className="w-2.5 h-2.5" />
                          )}
                          {signal.recommendation}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggle(coin.symbol)}
                      className="p-1 rounded hover:bg-accent/50"
                    >
                      <Star
                        className="w-3.5 h-3.5"
                        style={{
                          fill: "oklch(0.82 0.16 88)",
                          color: "oklch(0.82 0.16 88)",
                        }}
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Mobile */}
        <div
          className="md:hidden divide-y"
          style={{ borderColor: "oklch(0.18 0.008 235)" }}
        >
          {watchedCoins.map((coin) => {
            const signal = signals.get(coin.symbol);
            const isUp = coin.change24h >= 0;
            const sig = signal ? SIG_STYLE[signal.recommendation] : null;
            return (
              <div
                key={coin.symbol}
                className="flex items-center gap-3 px-4 py-3 exchange-row cursor-pointer"
                onClick={() => setSelectedCoin(coin)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSelectedCoin(coin);
                }}
              >
                <CoinLogo symbol={coin.symbol} color={coin.color} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {coin.symbol}
                    </span>
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {formatPrice(coin.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {coin.name}
                    </span>
                    <span
                      className="font-mono text-xs font-semibold"
                      style={{
                        color: isUp
                          ? "oklch(0.72 0.18 155)"
                          : "oklch(0.65 0.22 25)",
                      }}
                    >
                      {isUp ? "+" : ""}
                      {coin.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <SparklineCell
                    data={coin.sparkline}
                    isPositive={isUp}
                    width={48}
                    height={20}
                  />
                  {signal && sig && (
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono"
                      style={{ background: sig.bg, color: sig.color }}
                    >
                      {signal.recommendation}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(coin.symbol);
                    }}
                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <Star
                      className="w-4 h-4"
                      style={{
                        fill: "oklch(0.82 0.16 88)",
                        color: "oklch(0.82 0.16 88)",
                      }}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {liveCoin && selectedSignal && (
          <CoinDetailModal
            key="wl-modal"
            coin={liveCoin}
            signal={selectedSignal}
            isWatchlisted={watchlist.has(liveCoin.symbol)}
            onClose={() => setSelectedCoin(null)}
            onToggleWatchlist={handleToggle}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default WatchlistPage;
