import { Crown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { formatPrice } from "../data/cryptoData";
import { useAppStore } from "../store/appStore";

const UNDERLYINGS = ["BTC", "ETH", "SOL", "BNB"] as const;
type Underlying = (typeof UNDERLYINGS)[number];

const EXPIRIES = ["This Week", "Next Week", "Monthly", "Quarterly"] as const;
type Expiry = (typeof EXPIRIES)[number];

// Simple Black-Scholes approximation for option price
function bsCall(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
): number {
  const d1 =
    (Math.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  const Nd1 = normalCDF(d1);
  const Nd2 = normalCDF(d2);
  return S * Nd1 - K * Math.exp(-r * T) * Nd2;
}

function normalCDF(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const poly =
    t *
    (0.254829592 +
      t *
        (-0.284496736 +
          t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const result = 1 - poly * Math.exp((-x * x) / 2);
  return x >= 0 ? result : 1 - result;
}

function getExpiry(expiry: Expiry): number {
  switch (expiry) {
    case "This Week":
      return 7 / 365;
    case "Next Week":
      return 14 / 365;
    case "Monthly":
      return 30 / 365;
    case "Quarterly":
      return 90 / 365;
  }
}

function seededUnit(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

interface OptionRow {
  strike: number;
  callPrice: number;
  callDelta: number;
  callIV: number;
  callBid: number;
  callAsk: number;
  callVol: number;
  callOI: number;
  putPrice: number;
  putDelta: number;
  putIV: number;
  putBid: number;
  putAsk: number;
  putVol: number;
  putOI: number;
  itm: boolean;
}

export function OptionsPage() {
  const coins = useAppStore((s) => s.coins);
  const userSubscription = useAppStore((s) => s.userSubscription);
  const setActivePage = useAppStore((s) => s.setActivePage);
  const [underlying, setUnderlying] = useState<Underlying>("BTC");
  const [expiry, setExpiry] = useState<Expiry>("Monthly");
  const [selectedStrike, setSelectedStrike] = useState<number | null>(null);
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [qty, setQty] = useState("1");
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const nowMs = clock.getTime();

  const spotCoin = coins.find((c) => c.symbol === underlying);
  const S = spotCoin?.price ?? 67432;
  const T = getExpiry(expiry);
  const r = 0.05;
  const sigma = 0.7; // 70% IV for crypto

  const options = useMemo<OptionRow[]>(() => {
    const strikes = Array.from({ length: 10 }, (_, i) => {
      const pct = (i - 4.5) * 0.01; // ±5% around ATM
      const raw = S * (1 + pct);
      // Round to nice number
      const magnitude = 10 ** Math.floor(Math.log10(raw) - 1);
      return Math.round(raw / magnitude) * magnitude;
    });

    return strikes.map((K, idx) => {
      const seedBase =
        Math.round(K) + idx * 101 + Math.round(S) + Math.round(T * 10_000);
      const iv = sigma + (seededUnit(seedBase + 1) - 0.5) * 0.1;
      const callPrice = Math.max(bsCall(S, K, T, r, iv), 0);
      const putPrice = Math.max(callPrice - S + K * Math.exp(-r * T), 0);
      const d1 =
        (Math.log(S / K) + (r + 0.5 * iv ** 2) * T) / (iv * Math.sqrt(T));
      const callDelta = normalCDF(d1);
      const putDelta = callDelta - 1;
      const spread = callPrice * 0.02;
      const putSpread = putPrice * 0.02;
      return {
        strike: K,
        callPrice,
        callDelta,
        callIV: iv * 100,
        callBid: callPrice - spread,
        callAsk: callPrice + spread,
        callVol: Math.floor(seededUnit(seedBase + 2) * 2000 + 100),
        callOI: Math.floor(seededUnit(seedBase + 3) * 10000 + 500),
        putPrice,
        putDelta,
        putIV: iv * 100,
        putBid: putPrice - putSpread,
        putAsk: putPrice + putSpread,
        putVol: Math.floor(seededUnit(seedBase + 4) * 2000 + 100),
        putOI: Math.floor(seededUnit(seedBase + 5) * 10000 + 500),
        itm: K < S,
      };
    });
  }, [S, T]);

  const selected = options.find((o) => o.strike === selectedStrike);
  const premium = selected
    ? orderSide === "buy"
      ? selected.callAsk
      : selected.callBid
    : 0;
  const estimatedCost = premium * Number.parseFloat(qty || "1");

  const handleOrder = () => {
    toast.success(
      `${orderSide.toUpperCase()} ${qty} ${underlying} $${selectedStrike} CALL`,
      {
        description: `Premium: $${premium.toFixed(2)} • Total: $${estimatedCost.toFixed(2)} — Demo order`,
      },
    );
  };

  const fmt = (n: number) => (n < 1 ? `$${n.toFixed(3)}` : `$${n.toFixed(2)}`);

  const greekStats = selected
    ? [
        {
          label: "Delta",
          value: selected.callDelta.toFixed(3),
          color: "oklch(0.72 0.18 155)",
        },
        {
          label: "Gamma",
          value: (
            0.001 +
            seededUnit(Math.round(selected.strike + S + T * 10_000) + 11) * 0.002
          ).toFixed(4),
          color: "oklch(0.82 0.16 88)",
        },
        {
          label: "Theta",
          value: `-${(
            0.05 +
            seededUnit(Math.round(selected.strike + S + T * 10_000) + 12) * 0.1
          ).toFixed(3)}`,
          color: "oklch(0.65 0.22 25)",
        },
        {
          label: "Vega",
          value: (
            0.1 +
            seededUnit(Math.round(selected.strike + S + T * 10_000) + 13) * 0.2
          ).toFixed(3),
          color: "oklch(0.78 0.18 174)",
        },
        {
          label: "IV",
          value: `${selected.callIV.toFixed(1)}%`,
          color: "oklch(0.82 0.18 75)",
        },
      ]
    : [];

  const showUpgradeBanner =
    userSubscription.plan === "free" ||
    (userSubscription.expiresAt !== null &&
      userSubscription.expiresAt <= nowMs);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Upgrade banner */}
      {showUpgradeBanner && (
        <div
          className="mx-4 mt-3 mb-1 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3"
          style={{
            background: "oklch(0.78 0.18 174 / 0.08)",
            border: "1px solid oklch(0.78 0.18 174 / 0.35)",
          }}
        >
          <div className="flex items-center gap-2.5 flex-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "oklch(0.78 0.18 174 / 0.15)",
                border: "1px solid oklch(0.78 0.18 174 / 0.4)",
              }}
            >
              <Crown
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.78 0.18 174)" }}
              />
            </div>
            <div>
              <p
                className="text-sm font-mono font-semibold"
                style={{ color: "oklch(0.85 0.008 220)" }}
              >
                Options trading requires Standard or Pro plan
              </p>
              <p
                className="text-xs font-mono"
                style={{ color: "oklch(0.55 0.012 225)" }}
              >
                Upgrade to unlock full options trading with live signals and
                advanced analytics.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActivePage("subscription")}
            className="shrink-0 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all duration-200 whitespace-nowrap"
            style={{
              background: "oklch(0.78 0.18 174)",
              color: "oklch(0.10 0.005 240)",
              boxShadow: "0 2px 12px oklch(0.78 0.18 174 / 0.35)",
            }}
          >
            Upgrade to Unlock →
          </button>
        </div>
      )}
      <div className="px-4 py-4 space-y-4 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              Underlying:
            </span>
            <div className="flex gap-1">
              {UNDERLYINGS.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnderlying(u)}
                  className="px-2.5 py-1 text-xs font-mono rounded transition-colors"
                  style={
                    underlying === u
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
                  {u}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              Spot:
            </span>
            <span
              className="font-mono text-sm font-semibold"
              style={{ color: "oklch(0.82 0.16 88)" }}
            >
              {formatPrice(S)}
            </span>
          </div>
          <div className="flex gap-1 ml-auto">
            {EXPIRIES.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setExpiry(e)}
                className="px-2.5 py-1 text-xs font-mono rounded transition-colors"
                style={
                  expiry === e
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
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-4 items-start">
          {/* Options chain */}
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: "1px solid oklch(0.20 0.010 240)" }}
          >
            <div
              className="grid grid-cols-[1fr_auto_1fr] text-[11px] font-mono font-semibold text-muted-foreground"
              style={{
                background: "oklch(0.13 0.007 240)",
                borderBottom: "1px solid oklch(0.20 0.010 240)",
              }}
            >
              <div
                className="px-3 py-2 text-center"
                style={{ color: "oklch(0.72 0.18 155)" }}
              >
                CALLS
              </div>
              <div className="px-4 py-2 text-center">STRIKE</div>
              <div
                className="px-3 py-2 text-center"
                style={{ color: "oklch(0.65 0.22 25)" }}
              >
                PUTS
              </div>
            </div>

            {/* Sub-headers */}
            <div
              className="grid text-[10px] font-mono text-muted-foreground"
              style={{
                gridTemplateColumns: "repeat(7,1fr) auto repeat(7,1fr)",
                background: "oklch(0.135 0.007 240)",
                borderBottom: "1px solid oklch(0.20 0.010 240)",
              }}
            >
              {[
                "c-Last",
                "c-Chg%",
                "c-Bid",
                "c-Ask",
                "c-Vol",
                "c-OI",
                "c-IV",
                "Strike",
                "p-Last",
                "p-Chg%",
                "p-Bid",
                "p-Ask",
                "p-Vol",
                "p-OI",
                "p-IV",
              ].map((h) => (
                <div key={h} className="px-1.5 py-1.5 text-center">
                  {h.replace(/^[cp]-/, "")}
                </div>
              ))}
            </div>

            {/* Rows */}
            <div
              className="divide-y"
              style={{ borderColor: "oklch(0.18 0.008 235)" }}
            >
              {options.map((row) => {
                const isSelected = selectedStrike === row.strike;
                const callChg = (
                  ((row.callPrice - row.callPrice * 0.97) /
                    (row.callPrice * 0.97)) *
                  100
                ).toFixed(1);
                const putChg = (
                  ((row.putPrice - row.putPrice * 0.97) /
                    (row.putPrice * 0.97)) *
                  100
                ).toFixed(1);
                return (
                  <div
                    key={row.strike}
                    className="grid text-[11px] font-mono cursor-pointer transition-colors"
                    style={{
                      gridTemplateColumns: "repeat(7,1fr) auto repeat(7,1fr)",
                      background: isSelected
                        ? "oklch(0.82 0.16 88 / 0.08)"
                        : row.itm
                          ? "oklch(0.72 0.18 155 / 0.03)"
                          : undefined,
                    }}
                    onClick={() =>
                      setSelectedStrike(isSelected ? null : row.strike)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        setSelectedStrike(isSelected ? null : row.strike);
                    }}
                  >
                    {/* Calls */}
                    <div className="px-1.5 py-2 text-center text-foreground">
                      {fmt(row.callPrice)}
                    </div>
                    <div
                      className="px-1.5 py-2 text-center"
                      style={{ color: "oklch(0.72 0.18 155)" }}
                    >
                      +{callChg}%
                    </div>
                    <div className="px-1.5 py-2 text-center text-muted-foreground">
                      {fmt(row.callBid)}
                    </div>
                    <div className="px-1.5 py-2 text-center text-muted-foreground">
                      {fmt(row.callAsk)}
                    </div>
                    <div className="px-1.5 py-2 text-center text-muted-foreground">
                      {row.callVol.toLocaleString()}
                    </div>
                    <div className="px-1.5 py-2 text-center text-muted-foreground">
                      {row.callOI.toLocaleString()}
                    </div>
                    <div className="px-1.5 py-2 text-center text-muted-foreground">
                      {row.callIV.toFixed(0)}%
                    </div>
                    {/* Strike */}
                    <div
                      className="px-3 py-2 text-center font-semibold text-foreground"
                      style={{
                        background: isSelected
                          ? "oklch(0.82 0.16 88 / 0.2)"
                          : "oklch(0.13 0.007 240)",
                        borderLeft: "1px solid oklch(0.20 0.010 240)",
                        borderRight: "1px solid oklch(0.20 0.010 240)",
                      }}
                    >
                      {formatPrice(row.strike)}
                    </div>
                    {/* Puts */}
                    <div className="px-1.5 py-2 text-center text-foreground">
                      {fmt(row.putPrice)}
                    </div>
                    <div
                      className="px-1.5 py-2 text-center"
                      style={{ color: "oklch(0.65 0.22 25)" }}
                    >
                      -{putChg}%
                    </div>
                    <div className="px-1.5 py-2 text-center text-muted-foreground">
                      {fmt(row.putBid)}
                    </div>
                    <div className="px-1.5 py-2 text-center text-muted-foreground">
                      {fmt(row.putAsk)}
                    </div>
                    <div className="px-1.5 py-2 text-center text-muted-foreground">
                      {row.putVol.toLocaleString()}
                    </div>
                    <div className="px-1.5 py-2 text-center text-muted-foreground">
                      {row.putOI.toLocaleString()}
                    </div>
                    <div className="px-1.5 py-2 text-center text-muted-foreground">
                      {row.putIV.toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order panel */}
          <div className="space-y-3 sticky top-0">
            {/* Greeks summary */}
            {selected && (
              <div
                className="rounded-lg p-4"
                style={{
                  background: "oklch(0.135 0.007 240)",
                  border: "1px solid oklch(0.20 0.010 240)",
                }}
              >
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Greeks
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {greekStats.map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold" style={{ color }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order form */}
            <div
              className="rounded-lg p-4"
              style={{
                background: "oklch(0.135 0.007 240)",
                border: "1px solid oklch(0.20 0.010 240)",
              }}
            >
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Place Order
              </div>
              {!selected && (
                <p className="text-xs text-muted-foreground font-mono mb-3">
                  Select a strike from the chain above
                </p>
              )}
              {selected && (
                <div className="text-xs font-mono text-muted-foreground mb-3">
                  Strike:{" "}
                  <span className="text-foreground font-semibold">
                    {formatPrice(selected.strike)}
                  </span>
                  {" · "}Expiry:{" "}
                  <span className="text-foreground">{expiry}</span>
                </div>
              )}

              {/* Buy/Sell toggle */}
              <div className="flex gap-1 mb-3">
                {(["buy", "sell"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setOrderSide(s)}
                    className="flex-1 py-1.5 rounded text-xs font-bold font-mono uppercase transition-colors"
                    style={
                      orderSide === s
                        ? s === "buy"
                          ? {
                              background: "oklch(0.72 0.18 155 / 0.2)",
                              color: "oklch(0.72 0.18 155)",
                              border: "1px solid oklch(0.72 0.18 155 / 0.5)",
                            }
                          : {
                              background: "oklch(0.65 0.22 25 / 0.2)",
                              color: "oklch(0.65 0.22 25)",
                              border: "1px solid oklch(0.65 0.22 25 / 0.5)",
                            }
                        : {
                            background: "oklch(0.18 0.008 235)",
                            color: "oklch(0.55 0.012 225)",
                            border: "1px solid oklch(0.22 0.010 240)",
                          }
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Order type */}
              <div className="flex gap-1 mb-3">
                {(["market", "limit"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setOrderType(t)}
                    className="flex-1 py-1.5 rounded text-xs font-mono uppercase transition-colors capitalize"
                    style={
                      orderType === t
                        ? {
                            background: "oklch(0.82 0.16 88 / 0.12)",
                            color: "oklch(0.82 0.16 88)",
                            border: "1px solid oklch(0.82 0.16 88 / 0.35)",
                          }
                        : {
                            background: "oklch(0.18 0.008 235)",
                            color: "oklch(0.55 0.012 225)",
                            border: "1px solid oklch(0.22 0.010 240)",
                          }
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Quantity */}
              <div className="mb-3">
                <label
                  htmlFor="options-qty"
                  className="text-xs font-mono text-muted-foreground mb-1 block"
                >
                  Quantity
                </label>
                <input
                  id="options-qty"
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 rounded text-sm font-mono text-foreground outline-none"
                  style={{
                    background: "oklch(0.18 0.008 235)",
                    border: "1px solid oklch(0.22 0.010 240)",
                  }}
                />
              </div>

              {/* Premium info */}
              {selected && (
                <div className="mb-3 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Premium</span>
                    <span className="text-foreground">{fmt(premium)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Total Cost</span>
                    <span
                      className="font-semibold"
                      style={{ color: "oklch(0.82 0.16 88)" }}
                    >
                      ${estimatedCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Max Profit</span>
                    <span style={{ color: "oklch(0.72 0.18 155)" }}>
                      Unlimited
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Max Loss</span>
                    <span style={{ color: "oklch(0.65 0.22 25)" }}>
                      ${estimatedCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleOrder}
                disabled={!selected}
                className="w-full py-2.5 rounded text-sm font-bold font-mono uppercase transition-all disabled:opacity-40"
                style={
                  selected
                    ? orderSide === "buy"
                      ? {
                          background: "oklch(0.72 0.18 155)",
                          color: "oklch(0.07 0.005 155)",
                        }
                      : {
                          background: "oklch(0.65 0.22 25)",
                          color: "oklch(0.97 0.01 25)",
                        }
                    : {
                        background: "oklch(0.18 0.008 235)",
                        color: "oklch(0.40 0.008 225)",
                      }
                }
              >
                {selected ? `${orderSide.toUpperCase()} CALL` : "Select Strike"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OptionsPage;
