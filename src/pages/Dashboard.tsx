import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Clock,
  LayoutGrid,
  LogOut,
  Minus,
  RefreshCw,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AISignalFeed } from "../components/AISignalFeed";
import { CoinCard } from "../components/CoinCard";
import { CoinDetailSheet } from "../components/CoinDetailSheet";
import { Watchlist } from "../components/Watchlist";
import {
  type AISignal,
  type Coin,
  computeSignal,
  fluctuatePrices,
  formatPrice,
  initializeCoins,
} from "../data/cryptoData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

function useLiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function formatClock(d: Date): string {
  return d.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function truncatePrincipal(p: string): string {
  if (p.length <= 12) return p;
  return `${p.slice(0, 6)}...${p.slice(-4)}`;
}

// Market overview stats
function MarketSummary({
  coins,
  signals,
}: { coins: Coin[]; signals: Map<string, AISignal> }) {
  const buyCount = Array.from(signals.values()).filter(
    (s) => s.recommendation === "BUY",
  ).length;
  const sellCount = Array.from(signals.values()).filter(
    (s) => s.recommendation === "SELL",
  ).length;
  const holdCount = Array.from(signals.values()).filter(
    (s) => s.recommendation === "HOLD",
  ).length;
  const gainers = coins.filter((c) => c.change24h > 0).length;
  const losers = coins.filter((c) => c.change24h < 0).length;

  return (
    <div className="flex flex-wrap gap-3">
      {[
        {
          icon: TrendingUp,
          label: "BUY Signals",
          value: buyCount,
          className: "text-terminal-green",
        },
        {
          icon: TrendingDown,
          label: "SELL Signals",
          value: sellCount,
          className: "text-terminal-red",
        },
        {
          icon: Minus,
          label: "HOLD Signals",
          value: holdCount,
          className: "text-terminal-amber",
        },
        {
          icon: TrendingUp,
          label: "Gainers",
          value: gainers,
          className: "text-terminal-green",
        },
        {
          icon: TrendingDown,
          label: "Losers",
          value: losers,
          className: "text-terminal-red",
        },
      ].map(({ icon: Icon, label, value, className }) => (
        <div
          key={label}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md"
          style={{
            background: "oklch(0.16 0.012 235)",
            border: "1px solid oklch(0.22 0.012 240)",
          }}
        >
          <Icon className={`w-3.5 h-3.5 ${className}`} />
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className={`text-xs font-bold font-mono ${className}`}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Dashboard() {
  const { identity, clear } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString() ?? "";
  const clock = useLiveClock();

  // Coin state
  const [coins, setCoins] = useState<Coin[]>(() => initializeCoins());
  const [signals, setSignals] = useState<Map<string, AISignal>>(() => {
    const initial = initializeCoins();
    const map = new Map<string, AISignal>();
    for (const coin of initial) {
      map.set(coin.symbol, computeSignal(coin));
    }
    return map;
  });

  // Feed — recent signals in chronological reverse order
  const [signalFeed, setSignalFeed] = useState<AISignal[]>(() => {
    const initial = initializeCoins();
    return initial.map((coin) => ({
      ...computeSignal(coin),
      timestamp: Date.now() - Math.floor(Math.random() * 300_000),
    }));
  });

  // Watchlist
  const [watchlist, setWatchlist] = useState<Set<string>>(
    new Set(["BTC", "ETH", "SOL"]),
  );

  // Selected coin for detail
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);

  // Auto-refresh every 30s
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const coinsRef = useRef(coins);
  coinsRef.current = coins;

  useEffect(() => {
    const id = setInterval(() => {
      const newCoins = fluctuatePrices(coinsRef.current);
      const newSignals = new Map<string, AISignal>();
      const updatedSignals: AISignal[] = [];

      for (const coin of newCoins) {
        const sig = computeSignal(coin);
        newSignals.set(coin.symbol, sig);
        // Only add to feed if signal changed or random refresh
        if (Math.random() < 0.4) {
          updatedSignals.push({ ...sig, timestamp: Date.now() });
        }
      }

      setCoins(newCoins);
      setSignals(newSignals);
      if (updatedSignals.length > 0) {
        setSignalFeed((prev) => [...updatedSignals, ...prev].slice(0, 50));
      }
      setLastRefresh(Date.now());
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  // Manual refresh
  const handleRefresh = useCallback(() => {
    const newCoins = fluctuatePrices(coinsRef.current);
    const newSignals = new Map<string, AISignal>();
    for (const coin of newCoins) {
      newSignals.set(coin.symbol, computeSignal(coin));
    }
    setCoins(newCoins);
    setSignals(newSignals);
    setLastRefresh(Date.now());
    toast.success("Market data refreshed", { duration: 2000 });
  }, []);

  const toggleWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
        toast(`${symbol} removed from watchlist`, { duration: 2000 });
      } else {
        next.add(symbol);
        toast.success(`${symbol} added to watchlist`, { duration: 2000 });
      }
      return next;
    });
  }, []);

  const handleCoinClick = useCallback((coin: Coin) => {
    setSelectedCoin(coin);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedCoin(null);
  }, []);

  const selectedSignal = selectedCoin
    ? (signals.get(selectedCoin.symbol) ?? null)
    : null;
  // Keep selected coin in sync with live prices
  const liveSyncedCoin = selectedCoin
    ? (coins.find((c) => c.symbol === selectedCoin.symbol) ?? selectedCoin)
    : null;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(0.11 0.008 240)" }}
    >
      <Toaster />

      {/* Navbar */}
      <header
        className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 py-3"
        style={{
          background: "oklch(0.125 0.009 240)",
          borderBottom: "1px solid oklch(0.22 0.012 240)",
          boxShadow: "0 2px 12px oklch(0 0 0 / 0.3)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mr-2">
          <img
            src="/assets/generated/crypto-vision-ai-logo.svg"
            alt="Crypto Vision AI"
            className="w-7 h-7"
          />
          <span className="font-display font-bold text-base tracking-tight hidden sm:block">
            Crypto Vision <span className="text-terminal-cyan">AI</span>
          </span>
        </div>

        {/* Live indicator */}
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-md"
          style={{
            background: "oklch(0.72 0.18 155 / 0.1)",
            border: "1px solid oklch(0.72 0.18 155 / 0.25)",
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-terminal-green animate-pulse" />
          <span className="text-xs text-terminal-green font-mono font-semibold">
            LIVE
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Clock */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hidden md:flex">
          <Clock className="w-3.5 h-3.5" />
          {formatClock(clock)} UTC
        </div>

        {/* Refresh */}
        <button
          type="button"
          onClick={handleRefresh}
          className="p-2 rounded-md transition-colors hover:bg-accent/50 text-muted-foreground hover:text-foreground"
          title="Refresh market data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Principal */}
        {principal && (
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-xs"
            style={{
              background: "oklch(0.16 0.012 235)",
              border: "1px solid oklch(0.22 0.012 240)",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-terminal-cyan" />
            <span className="text-muted-foreground">
              {truncatePrincipal(principal)}
            </span>
          </div>
        )}

        {/* Logout */}
        <button
          type="button"
          onClick={clear}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200"
          style={{
            background: "oklch(0.62 0.22 25 / 0.1)",
            border: "1px solid oklch(0.62 0.22 25 / 0.25)",
            color: "oklch(0.72 0.15 25)",
          }}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 md:px-6 py-5">
            {/* Page title + market summary */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
              <div>
                <h1 className="font-display font-bold text-xl text-foreground">
                  Market Overview
                </h1>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Last updated: {new Date(lastRefresh).toLocaleTimeString()} ·
                  Auto-refreshes every 30s
                </p>
              </div>
              <div className="sm:ml-auto">
                <MarketSummary coins={coins} signals={signals} />
              </div>
            </div>

            <Tabs defaultValue="market" className="w-full">
              <TabsList
                className="mb-5"
                style={{
                  background: "oklch(0.14 0.01 235)",
                  border: "1px solid oklch(0.22 0.012 240)",
                }}
              >
                <TabsTrigger
                  value="market"
                  className="text-xs font-mono data-[state=active]:text-terminal-cyan"
                >
                  <LayoutGrid className="w-3.5 h-3.5 mr-1.5" />
                  All Markets
                </TabsTrigger>
                <TabsTrigger
                  value="watchlist"
                  className="text-xs font-mono data-[state=active]:text-terminal-amber"
                >
                  <Star className="w-3.5 h-3.5 mr-1.5" />
                  Watchlist
                  {watchlist.size > 0 && (
                    <span
                      className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                      style={{
                        background: "oklch(0.78 0.16 75 / 0.2)",
                        color: "oklch(0.82 0.18 75)",
                      }}
                    >
                      {watchlist.size}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="market">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {coins.map((coin, i) => {
                    const signal = signals.get(coin.symbol);
                    if (!signal) return null;
                    return (
                      <CoinCard
                        key={coin.symbol}
                        coin={coin}
                        signal={signal}
                        isWatchlisted={watchlist.has(coin.symbol)}
                        onToggleWatchlist={toggleWatchlist}
                        onClick={handleCoinClick}
                        index={i}
                      />
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="watchlist">
                <Watchlist
                  coins={coins}
                  signals={signals}
                  watchlistSymbols={watchlist}
                  onCoinClick={handleCoinClick}
                  onToggleWatchlist={toggleWatchlist}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Right sidebar: AI Signal Feed */}
        <aside
          className="w-72 shrink-0 hidden xl:flex flex-col overflow-hidden"
          style={{
            background: "oklch(0.125 0.009 240)",
            borderLeft: "1px solid oklch(0.22 0.012 240)",
          }}
        >
          <AISignalFeed signals={signalFeed} />
        </aside>
      </div>

      {/* Coin detail sheet */}
      <AnimatePresence>
        {liveSyncedCoin && selectedSignal && (
          <CoinDetailSheet
            key="detail"
            coin={liveSyncedCoin}
            signal={selectedSignal}
            isWatchlisted={watchlist.has(liveSyncedCoin.symbol)}
            onClose={handleCloseDetail}
            onToggleWatchlist={toggleWatchlist}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer
        className="text-center py-3 text-[11px] text-muted-foreground font-mono"
        style={{ borderTop: "1px solid oklch(0.18 0.01 235)" }}
      >
        © {new Date().getFullYear()}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-terminal-cyan hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}

