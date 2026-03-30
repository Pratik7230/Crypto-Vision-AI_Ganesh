import { Minus, TrendingDown, TrendingUp, X } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { toast } from "sonner";
import { CoinLogo } from "../components/CoinLogo";
import { formatLargeNumber, formatPrice } from "../data/cryptoData";
import type { Recommendation } from "../data/cryptoData";
import { generatePerformanceData } from "../data/portfolioData";
import { useAppStore } from "../store/appStore";

const PERF_DATA = generatePerformanceData();

const SIG_STYLE: Record<Recommendation, { color: string; bg: string }> = {
  BUY: { color: "oklch(0.72 0.18 155)", bg: "oklch(0.72 0.18 155 / 0.15)" },
  SELL: { color: "oklch(0.65 0.22 25)", bg: "oklch(0.65 0.22 25 / 0.15)" },
  HOLD: { color: "oklch(0.82 0.16 88)", bg: "oklch(0.82 0.16 88 / 0.15)" },
};

export function PortfolioPage() {
  const coins = useAppStore((s) => s.coins);
  const signals = useAppStore((s) => s.signals);
  const positions = useAppStore((s) => s.positions);
  const removePosition = useAppStore((s) => s.removePosition);

  const USDT_BALANCE = 10_000;

  // Calculate portfolio value
  const positionData = useMemo(() => {
    return positions.map((pos) => {
      const coin = coins.find((c) => c.symbol === pos.symbol);
      const currentPrice = coin?.price ?? pos.entryPrice;
      const marketValue = pos.quantity * currentPrice;
      const costBasis = pos.quantity * pos.entryPrice;
      const pnl =
        pos.side === "LONG" ? marketValue - costBasis : costBasis - marketValue;
      const pnlPct = (pnl / costBasis) * 100;
      const signal = signals.get(pos.symbol);
      return {
        ...pos,
        currentPrice,
        marketValue,
        pnl,
        pnlPct,
        signal,
        color: pos.color,
      };
    });
  }, [positions, coins, signals]);

  const totalPositionValue = positionData.reduce(
    (sum, p) => sum + p.marketValue,
    0,
  );
  const totalPortfolioValue = totalPositionValue + USDT_BALANCE;
  const totalPnL = positionData.reduce((sum, p) => sum + p.pnl, 0);
  const pnlPct =
    totalPositionValue > 0
      ? (totalPnL / (totalPositionValue - totalPnL)) * 100
      : 0;
  const todayPnL = totalPnL * 0.12; // mock today's PnL

  // Pie data
  const pieData = [
    ...positionData.map((p) => ({
      name: p.symbol,
      value: p.marketValue,
      color: p.color,
    })),
    { name: "USDT", value: USDT_BALANCE, color: "#26a17b" },
  ];

  const handleClose = (symbol: string) => {
    removePosition(symbol);
    toast.success(`${symbol} position closed`, {
      description: "Position removed from portfolio",
    });
  };

  const summaryCards = [
    {
      label: "Total Portfolio",
      value: formatLargeNumber(totalPortfolioValue),
      sub: "USD Value",
      color: "oklch(0.82 0.16 88)",
    },
    {
      label: "Total P&L",
      value: `${totalPnL >= 0 ? "+" : ""}${formatLargeNumber(totalPnL)}`,
      sub: `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%`,
      color: totalPnL >= 0 ? "oklch(0.72 0.18 155)" : "oklch(0.65 0.22 25)",
    },
    {
      label: "Today's P&L",
      value: `${todayPnL >= 0 ? "+" : ""}${formatLargeNumber(todayPnL)}`,
      sub: "Last 24 hours",
      color: todayPnL >= 0 ? "oklch(0.72 0.18 155)" : "oklch(0.65 0.22 25)",
    },
    {
      label: "Positions",
      value: `${positions.length}`,
      sub: "Open positions",
      color: "oklch(0.78 0.18 174)",
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-4 space-y-5 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-5">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {summaryCards.map(({ label, value, sub, color }) => (
            <div
              key={label}
              className="rounded-lg p-4"
              style={{
                background: "oklch(0.135 0.007 240)",
                border: "1px solid oklch(0.20 0.010 240)",
              }}
            >
              <div className="text-xs text-muted-foreground font-mono mb-1.5">
                {label}
              </div>
              <div className="text-xl font-bold font-mono" style={{ color }}>
                {value}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">
                {sub}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-4">
          {/* Performance chart */}
          <div
            className="rounded-lg p-4"
            style={{
              background: "oklch(0.135 0.007 240)",
              border: "1px solid oklch(0.20 0.010 240)",
            }}
          >
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              30-Day Performance
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PERF_DATA}>
                  <defs>
                    <linearGradient id="perf-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="oklch(0.82 0.16 88)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="oklch(0.82 0.16 88)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="oklch(0.82 0.16 88)"
                    strokeWidth={1.5}
                    fill="url(#perf-grad)"
                    dot={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.16 0.008 235)",
                      border: "1px solid oklch(0.25 0.012 240)",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontFamily: "JetBrains Mono",
                      color: "oklch(0.85 0.008 220)",
                    }}
                    formatter={(v: number) => [
                      `$${v.toLocaleString()}`,
                      "Value",
                    ]}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Allocation pie */}
          <div
            className="rounded-lg p-4"
            style={{
              background: "oklch(0.135 0.007 240)",
              border: "1px solid oklch(0.20 0.010 240)",
            }}
          >
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Allocation
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {pieData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.16 0.008 235)",
                      border: "1px solid oklch(0.25 0.012 240)",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontFamily: "JetBrains Mono",
                      color: "oklch(0.85 0.008 220)",
                    }}
                    formatter={(v: number) => [
                      `$${v.toLocaleString()}`,
                      "Value",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="space-y-1.5 mt-2">
              {pieData.map(({ name, value, color }) => {
                const pct = ((value / totalPortfolioValue) * 100).toFixed(1);
                return (
                  <div
                    key={name}
                    className="flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: color }}
                      />
                      <span className="text-muted-foreground">{name}</span>
                    </div>
                    <span className="text-foreground">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Positions table */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: "1px solid oklch(0.20 0.010 240)" }}
        >
          <div
            className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest"
            style={{
              background: "oklch(0.135 0.007 240)",
              borderBottom: "1px solid oklch(0.20 0.010 240)",
            }}
          >
            Open Positions
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr
                  style={{
                    background: "oklch(0.13 0.007 240)",
                    borderBottom: "1px solid oklch(0.20 0.010 240)",
                  }}
                >
                  {[
                    "Coin",
                    "Side",
                    "Qty",
                    "Entry",
                    "Current",
                    "P&L ($)",
                    "P&L (%)",
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
                {positionData.map((pos) => {
                  const sigStyle = pos.signal
                    ? SIG_STYLE[pos.signal.recommendation]
                    : null;
                  return (
                    <tr
                      key={pos.symbol}
                      className="exchange-row"
                      style={{
                        borderBottom: "1px solid oklch(0.18 0.008 235)",
                      }}
                    >
                      <td className="pl-4 pr-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <CoinLogo
                            symbol={pos.symbol}
                            color={pos.color}
                            size={24}
                          />
                          <span className="text-xs font-semibold text-foreground">
                            {pos.symbol}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono"
                          style={
                            pos.side === "LONG"
                              ? {
                                  background: "oklch(0.72 0.18 155 / 0.15)",
                                  color: "oklch(0.72 0.18 155)",
                                }
                              : {
                                  background: "oklch(0.65 0.22 25 / 0.15)",
                                  color: "oklch(0.65 0.22 25)",
                                }
                          }
                        >
                          {pos.side}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-foreground">
                        {pos.quantity % 1 === 0
                          ? pos.quantity.toLocaleString()
                          : pos.quantity.toFixed(4)}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                        {formatPrice(pos.entryPrice)}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-foreground">
                        {formatPrice(pos.currentPrice)}
                      </td>
                      <td
                        className="px-3 py-2.5 font-mono text-xs font-semibold"
                        style={{
                          color:
                            pos.pnl >= 0
                              ? "oklch(0.72 0.18 155)"
                              : "oklch(0.65 0.22 25)",
                        }}
                      >
                        {pos.pnl >= 0 ? "+" : ""}
                        {formatLargeNumber(pos.pnl)}
                      </td>
                      <td
                        className="px-3 py-2.5 font-mono text-xs font-semibold"
                        style={{
                          color:
                            pos.pnlPct >= 0
                              ? "oklch(0.72 0.18 155)"
                              : "oklch(0.65 0.22 25)",
                        }}
                      >
                        {pos.pnlPct >= 0 ? "+" : ""}
                        {pos.pnlPct.toFixed(2)}%
                      </td>
                      <td className="px-3 py-2.5">
                        {pos.signal && sigStyle && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono"
                            style={{
                              background: sigStyle.bg,
                              color: sigStyle.color,
                            }}
                          >
                            {pos.signal.recommendation === "BUY" && (
                              <TrendingUp className="w-2.5 h-2.5" />
                            )}
                            {pos.signal.recommendation === "SELL" && (
                              <TrendingDown className="w-2.5 h-2.5" />
                            )}
                            {pos.signal.recommendation === "HOLD" && (
                              <Minus className="w-2.5 h-2.5" />
                            )}
                            {pos.signal.recommendation}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => handleClose(pos.symbol)}
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors hover:opacity-80"
                          style={{
                            background: "oklch(0.65 0.22 25 / 0.15)",
                            color: "oklch(0.65 0.22 25)",
                            border: "1px solid oklch(0.65 0.22 25 / 0.4)",
                          }}
                        >
                          <X className="w-3 h-3 inline mr-0.5" />
                          Close
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {positionData.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground font-mono">
              No open positions
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PortfolioPage;
