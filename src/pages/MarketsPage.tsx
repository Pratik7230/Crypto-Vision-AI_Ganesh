import {
  Brain,
  Minus,
  Search,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { CoinDetailModal } from "../components/CoinDetailModal";
import { CoinLogo } from "../components/CoinLogo";
import { SparklineCell } from "../components/SparklineCell";
import {
  type Coin,
  type CoinCategory,
  formatLargeNumber,
  formatPrice,
} from "../data/cryptoData";
import type { Recommendation } from "../data/cryptoData";
import { useAppStore } from "../store/appStore";

const CATEGORIES: { id: CoinCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "major", label: "Major" },
  { id: "altcoin", label: "Altcoins" },
  { id: "digitalCoin", label: "Digital Coins" },
  { id: "memeCoin", label: "Meme Coins" },
];

const SIG_STYLE: Record<Recommendation, { color: string; bg: string }> = {
  BUY: { color: "oklch(0.72 0.18 155)", bg: "oklch(0.72 0.18 155 / 0.15)" },
  SELL: { color: "oklch(0.65 0.22 25)", bg: "oklch(0.65 0.22 25 / 0.15)" },
  HOLD: { color: "oklch(0.82 0.16 88)", bg: "oklch(0.82 0.16 88 / 0.15)" },
};

function SignalBadge({ rec }: { rec: Recommendation }) {
  const s = SIG_STYLE[rec];
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.color}40`,
      }}
    >
      {rec === "BUY" && <TrendingUp className="w-2.5 h-2.5" />}
      {rec === "SELL" && <TrendingDown className="w-2.5 h-2.5" />}
      {rec === "HOLD" && <Minus className="w-2.5 h-2.5" />}
      {rec}
    </span>
  );
}

export function MarketsPage() {
  const coins = useAppStore((s) => s.coins);
  const signals = useAppStore((s) => s.signals);
  const watchlist = useAppStore((s) => s.watchlist);
  const toggleWatchlist = useAppStore((s) => s.toggleWatchlist);

  const [category, setCategory] = useState<CoinCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);

  const filtered = coins.filter((c) => {
    if (category !== "all" && c.category !== category) return false;
    if (
      search &&
      !c.symbol.toLowerCase().includes(search.toLowerCase()) &&
      !c.name.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const liveCoin = selectedCoin
    ? (coins.find((c) => c.symbol === selectedCoin.symbol) ?? selectedCoin)
    : null;
  const selectedSignal = selectedCoin
    ? (signals.get(selectedCoin.symbol) ?? null)
    : null;

  const handleToggle = (symbol: string) => {
    const inList = watchlist.has(symbol);
    toggleWatchlist(symbol);
    toast(
      inList
        ? `${symbol} removed from watchlist`
        : `${symbol} added to watchlist`,
      {
        duration: 2000,
      },
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div
        className="flex flex-wrap items-center gap-2 px-4 py-3 shrink-0"
        style={{ borderBottom: "1px solid oklch(0.20 0.010 240)" }}
      >
        <h1 className="font-display font-bold text-base text-foreground">
          Markets
        </h1>

        {/* Category filter */}
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setCategory(id)}
              className="px-2.5 py-1 text-xs font-mono rounded transition-colors"
              style={
                category === id
                  ? {
                      background: "oklch(0.82 0.16 88 / 0.15)",
                      color: "oklch(0.82 0.16 88)",
                      border: "1px solid oklch(0.82 0.16 88 / 0.4)",
                    }
                  : {
                      background: "transparent",
                      color: "oklch(0.55 0.012 225)",
                      border: "1px solid oklch(0.22 0.010 240)",
                    }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded w-full sm:w-auto sm:ml-auto mt-1 sm:mt-0"
          style={{
            background: "oklch(0.155 0.008 235)",
            border: "1px solid oklch(0.22 0.010 240)",
          }}
        >
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search coins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none w-32"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        {/* Desktop table */}
        <table className="w-full hidden md:table">
          <thead className="sticky top-0 z-10">
            <tr
              style={{
                background: "oklch(0.13 0.007 240)",
                borderBottom: "1px solid oklch(0.20 0.010 240)",
              }}
            >
              {[
                "#",
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
                  className="px-3 py-2 text-left text-[11px] font-mono font-medium text-muted-foreground whitespace-nowrap first:pl-4"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((coin, i) => {
              const signal = signals.get(coin.symbol);
              const isUp = coin.change24h >= 0;
              const inWl = watchlist.has(coin.symbol);
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
                  <td className="pl-4 pr-2 py-2.5 text-xs font-mono text-muted-foreground">
                    {i + 1}
                  </td>
                  <td className="px-3 py-2.5">
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
                    {signal && (
                      <div className="flex items-center gap-1">
                        <Brain className="w-3 h-3 text-muted-foreground" />
                        <SignalBadge rec={signal.recommendation} />
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggle(coin.symbol)}
                      className="p-1 rounded hover:bg-accent/50 transition-colors"
                    >
                      <Star
                        className="w-3.5 h-3.5 transition-colors"
                        style={
                          inWl
                            ? {
                                fill: "oklch(0.82 0.16 88)",
                                color: "oklch(0.82 0.16 88)",
                              }
                            : { color: "oklch(0.40 0.008 225)" }
                        }
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Mobile cards */}
        <div
          className="md:hidden divide-y"
          style={{ borderColor: "oklch(0.18 0.008 235)" }}
        >
          {filtered.map((coin) => {
            const signal = signals.get(coin.symbol);
            const isUp = coin.change24h >= 0;
            const inWl = watchlist.has(coin.symbol);
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
                  {signal && <SignalBadge rec={signal.recommendation} />}
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
                      style={
                        inWl
                          ? {
                              fill: "oklch(0.82 0.16 88)",
                              color: "oklch(0.82 0.16 88)",
                            }
                          : { color: "oklch(0.40 0.008 225)" }
                      }
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground font-mono text-sm">
              No coins found
            </p>
          </div>
        )}
      </div>

      {/* Coin detail modal */}
      <AnimatePresence>
        {liveCoin && selectedSignal && (
          <CoinDetailModal
            key="modal"
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
