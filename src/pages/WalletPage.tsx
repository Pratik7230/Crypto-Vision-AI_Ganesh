import { ArrowDownToLine, ArrowUpFromLine, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CoinLogo } from "../components/CoinLogo";
import { formatPrice } from "../data/cryptoData";
import { INITIAL_WALLET } from "../data/portfolioData";
import { useAppStore } from "../store/appStore";

export function WalletPage() {
  const coins = useAppStore((s) => s.coins);
  const [hideSmall, setHideSmall] = useState(false);

  const walletItems = INITIAL_WALLET.map((w) => {
    const coin = coins.find((c) => c.symbol === w.symbol);
    const price = coin?.price ?? (w.symbol === "USDT" ? 1 : 0);
    const usdValue = w.amount * price;
    const change24h = coin?.change24h ?? 0;
    return { ...w, usdValue, change24h, price };
  });

  const filteredItems = hideSmall
    ? walletItems.filter((w) => w.usdValue >= 10)
    : walletItems;
  const totalUSD = walletItems.reduce((sum, w) => sum + w.usdValue, 0);

  // BTC equivalent
  const btcPrice = coins.find((c) => c.symbol === "BTC")?.price ?? 67432;
  const totalBTC = totalUSD / btcPrice;

  const handleDeposit = (symbol: string) => {
    toast.success(`Deposit ${symbol}`, {
      description: "Deposit address generated — demo mode",
    });
  };
  const handleWithdraw = (symbol: string) => {
    toast(`Withdraw ${symbol}`, {
      description: "Withdrawal form opened — demo mode",
    });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-4 space-y-5 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-5">
        {/* Total balance hero */}
        <div
          className="rounded-xl p-6"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.155 0.008 235) 0%, oklch(0.13 0.007 240) 100%)",
            border: "1px solid oklch(0.22 0.010 240)",
          }}
        >
          <div className="text-xs text-muted-foreground font-mono mb-2">
            Estimated Balance
          </div>
          <div className="text-3xl font-bold font-mono text-foreground mb-1">
            $
            {totalUSD.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="text-sm font-mono text-muted-foreground">
            ≈ {totalBTC.toFixed(6)} BTC
          </div>
          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={() => toast.success("Deposit initiated — demo mode")}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold font-mono transition-colors"
              style={{
                background: "oklch(0.82 0.16 88)",
                color: "oklch(0.1 0.01 88)",
              }}
            >
              <ArrowDownToLine className="w-4 h-4" />
              Deposit
            </button>
            <button
              type="button"
              onClick={() => toast("Withdraw initiated — demo mode")}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold font-mono transition-colors"
              style={{
                background: "oklch(0.20 0.010 240)",
                color: "oklch(0.85 0.008 220)",
                border: "1px solid oklch(0.28 0.012 240)",
              }}
            >
              <ArrowUpFromLine className="w-4 h-4" />
              Withdraw
            </button>
          </div>
        </div>

        {/* Assets table */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: "1px solid oklch(0.20 0.010 240)" }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{
              background: "oklch(0.135 0.007 240)",
              borderBottom: "1px solid oklch(0.20 0.010 240)",
            }}
          >
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Assets
            </span>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground cursor-pointer select-none">
              <button
                type="button"
                onClick={() => setHideSmall((v) => !v)}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                {hideSmall ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                Hide small balances
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px]">
              <thead>
                <tr
                  style={{
                    background: "oklch(0.13 0.007 240)",
                    borderBottom: "1px solid oklch(0.20 0.010 240)",
                  }}
                >
                  {[
                    "Coin",
                    "Amount",
                    "USD Value",
                    "24h %",
                    "Price",
                    "Actions",
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
                {filteredItems.map((item) => {
                  const isUp = item.change24h >= 0;
                  return (
                    <tr
                      key={item.symbol}
                      className="exchange-row"
                      style={{
                        borderBottom: "1px solid oklch(0.18 0.008 235)",
                      }}
                    >
                      <td className="pl-4 pr-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <CoinLogo
                            symbol={item.symbol}
                            color={item.color}
                            size={28}
                          />
                          <div>
                            <div className="text-xs font-semibold text-foreground">
                              {item.symbol}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {item.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono text-sm text-foreground">
                        {item.amount % 1 === 0
                          ? item.amount.toLocaleString()
                          : item.amount.toFixed(6)}
                      </td>
                      <td className="px-3 py-3 font-mono text-sm font-semibold text-foreground">
                        $
                        {item.usdValue.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        className="px-3 py-3 font-mono text-sm"
                        style={{
                          color: isUp
                            ? "oklch(0.72 0.18 155)"
                            : "oklch(0.65 0.22 25)",
                        }}
                      >
                        {isUp ? "+" : ""}
                        {item.change24h.toFixed(2)}%
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                        {formatPrice(item.price)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDeposit(item.symbol)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-semibold transition-colors"
                            style={{
                              background: "oklch(0.82 0.16 88 / 0.12)",
                              color: "oklch(0.82 0.16 88)",
                              border: "1px solid oklch(0.82 0.16 88 / 0.35)",
                            }}
                          >
                            <ArrowDownToLine className="w-3 h-3" />
                            Dep
                          </button>
                          <button
                            type="button"
                            onClick={() => handleWithdraw(item.symbol)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-semibold transition-colors"
                            style={{
                              background: "oklch(0.20 0.010 240)",
                              color: "oklch(0.70 0.010 225)",
                              border: "1px solid oklch(0.28 0.012 240)",
                            }}
                          >
                            <ArrowUpFromLine className="w-3 h-3" />
                            Wdw
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
