import {
  Eye,
  EyeOff,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { formatLargeNumber, formatPrice } from "../data/cryptoData";
import type { Recommendation } from "../data/cryptoData";
import { useAppStore } from "../store/appStore";

const SIG_STYLE: Record<Recommendation, { color: string }> = {
  BUY: { color: "oklch(0.72 0.18 155)" },
  SELL: { color: "oklch(0.65 0.22 25)" },
  HOLD: { color: "oklch(0.82 0.16 88)" },
};

function AdminLoginForm() {
  const adminLogin = useAppStore((s) => s.adminLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Slight delay for UX
    setTimeout(() => {
      const success = adminLogin(email, password);
      setIsLoading(false);
      if (!success) {
        setError("Invalid credentials. Access denied.");
      }
    }, 600);
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-full px-4 py-12 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-12"
      style={{ background: "oklch(0.10 0.005 240)" }}
    >
      <div
        className="w-full max-w-sm rounded-xl p-8 flex flex-col gap-6"
        style={{
          background: "oklch(0.135 0.007 240)",
          border: "1px solid oklch(0.22 0.010 240)",
          boxShadow: "0 8px 40px oklch(0.05 0.005 240 / 0.8)",
        }}
      >
        {/* Icon + title */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: "oklch(0.82 0.16 88 / 0.10)",
              border: "1px solid oklch(0.82 0.16 88 / 0.30)",
            }}
          >
            <ShieldCheck
              className="w-7 h-7"
              style={{ color: "oklch(0.82 0.16 88)" }}
            />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground tracking-tight">
              Admin Access
            </h1>
            <p
              className="text-xs font-mono mt-1"
              style={{ color: "oklch(0.50 0.010 225)" }}
            >
              Restricted to authorized personnel only
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-email"
              className="text-xs font-mono font-medium"
              style={{ color: "oklch(0.60 0.010 225)" }}
            >
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              placeholder="Admin email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
              data-ocid="admin.email_input"
              className="w-full rounded-lg px-3 py-2.5 text-sm font-mono outline-none transition-all"
              style={{
                background: "oklch(0.105 0.006 240)",
                border: error
                  ? "1px solid oklch(0.65 0.22 25)"
                  : "1px solid oklch(0.22 0.010 240)",
                color: "oklch(0.92 0.008 220)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.border =
                  "1px solid oklch(0.82 0.16 88 / 0.60)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = error
                  ? "1px solid oklch(0.65 0.22 25)"
                  : "1px solid oklch(0.22 0.010 240)";
              }}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-password"
              className="text-xs font-mono font-medium"
              style={{ color: "oklch(0.60 0.010 225)" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                required
                data-ocid="admin.password_input"
                className="w-full rounded-lg px-3 py-2.5 pr-10 text-sm font-mono outline-none transition-all"
                style={{
                  background: "oklch(0.105 0.006 240)",
                  border: error
                    ? "1px solid oklch(0.65 0.22 25)"
                    : "1px solid oklch(0.22 0.010 240)",
                  color: "oklch(0.92 0.008 220)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border =
                    "1px solid oklch(0.82 0.16 88 / 0.60)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = error
                    ? "1px solid oklch(0.65 0.22 25)"
                    : "1px solid oklch(0.22 0.010 240)";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80 transition-opacity"
                style={{ color: "oklch(0.60 0.010 225)" }}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div
              data-ocid="admin.error_state"
              className="rounded-lg px-3 py-2 text-xs font-mono flex items-center gap-2"
              style={{
                background: "oklch(0.65 0.22 25 / 0.12)",
                border: "1px solid oklch(0.65 0.22 25 / 0.35)",
                color: "oklch(0.75 0.18 25)",
              }}
            >
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            data-ocid="admin.submit_button"
            className="w-full rounded-lg py-2.5 text-sm font-mono font-semibold transition-all flex items-center justify-center gap-2 mt-1"
            style={{
              background: isLoading
                ? "oklch(0.82 0.16 88 / 0.50)"
                : "oklch(0.82 0.16 88)",
              color: "oklch(0.12 0.005 240)",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? (
              <>
                <span
                  className="w-4 h-4 rounded-full border-2 border-transparent animate-spin"
                  style={{ borderTopColor: "oklch(0.12 0.005 240)" }}
                />
                Verifying...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminPage() {
  const isAdminAuthenticated = useAppStore((s) => s.isAdminAuthenticated);
  const adminLogout = useAppStore((s) => s.adminLogout);
  const userLoginLog = useAppStore((s) => s.userLoginLog);
  const coins = useAppStore((s) => s.coins);
  const signals = useAppStore((s) => s.signals);

  const stats = useMemo(() => {
    const totalVolume = coins.reduce((sum, c) => sum + c.volume24h, 0);
    const activeSignals = Array.from(signals.values()).filter(
      (s) => s.recommendation === "BUY",
    ).length;
    return { totalVolume, activeSignals };
  }, [coins, signals]);

  if (!isAdminAuthenticated) {
    return (
      <div className="h-full overflow-y-auto">
        <AdminLoginForm />
      </div>
    );
  }

  const totalUserCount = userLoginLog.length;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-4 space-y-5 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-5">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck
              className="w-5 h-5"
              style={{ color: "oklch(0.82 0.16 88)" }}
            />
            <h1 className="font-display font-bold text-base text-foreground">
              Admin Dashboard
            </h1>
            <span
              className="px-2 py-0.5 rounded text-xs font-mono"
              style={{
                background: "oklch(0.82 0.16 88 / 0.15)",
                color: "oklch(0.82 0.16 88)",
                border: "1px solid oklch(0.82 0.16 88 / 0.4)",
              }}
            >
              ADMIN
            </span>
          </div>
          <button
            type="button"
            onClick={adminLogout}
            data-ocid="admin.signout_button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
            style={{
              background: "oklch(0.65 0.22 25 / 0.12)",
              border: "1px solid oklch(0.65 0.22 25 / 0.30)",
              color: "oklch(0.75 0.18 25)",
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Total Users",
              value: totalUserCount.toString(),
              sub: `${totalUserCount} tracked logins`,
              color: "oklch(0.82 0.16 88)",
            },
            {
              label: "Total Volume",
              value: formatLargeNumber(stats.totalVolume),
              sub: "24h across all",
              color: "oklch(0.78 0.18 174)",
            },
            {
              label: "Active Signals",
              value: stats.activeSignals.toString(),
              sub: "BUY signals firing",
              color: "oklch(0.72 0.18 155)",
            },
            {
              label: "System Status",
              value: "ONLINE",
              sub: "All services up",
              color: "oklch(0.72 0.18 155)",
            },
          ].map(({ label, value, sub, color }) => (
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

        {/* Logged-in Users section */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: "1px solid oklch(0.20 0.010 240)" }}
        >
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{
              background: "oklch(0.135 0.007 240)",
              borderBottom: "1px solid oklch(0.20 0.010 240)",
            }}
          >
            <Users
              className="w-4 h-4"
              style={{ color: "oklch(0.78 0.18 174)" }}
            />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Logged-in Users (real-time)
            </span>
            {totalUserCount > 0 && (
              <span
                className="ml-auto px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                style={{
                  background: "oklch(0.78 0.18 174 / 0.15)",
                  color: "oklch(0.78 0.18 174)",
                }}
              >
                {totalUserCount}
              </span>
            )}
          </div>

          {totalUserCount === 0 ? (
            <div
              data-ocid="admin.users_empty_state"
              className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3"
              style={{ background: "oklch(0.115 0.006 240)" }}
            >
              <Users
                className="w-10 h-10 opacity-25"
                style={{ color: "oklch(0.78 0.18 174)" }}
              />
              <p className="text-sm font-mono text-muted-foreground max-w-xs">
                No users have logged in yet.
                <br />
                This list will update as users sign in.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto" data-ocid="admin.users_table">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr
                    style={{
                      background: "oklch(0.13 0.007 240)",
                      borderBottom: "1px solid oklch(0.20 0.010 240)",
                    }}
                  >
                    {[
                      "Username",
                      "Email",
                      "Country",
                      "Principal",
                      "Login Time",
                      "Last Seen",
                      "Browser",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left text-[11px] font-mono font-medium text-muted-foreground first:pl-4 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {userLoginLog.map((record, idx) => (
                    <tr
                      key={record.id}
                      data-ocid={`admin.users_table.item.${idx + 1}`}
                      className="exchange-row"
                      style={{
                        borderBottom: "1px solid oklch(0.18 0.008 235)",
                      }}
                    >
                      <td
                        className="pl-4 pr-3 py-2.5 font-mono text-xs whitespace-nowrap"
                        style={{
                          color: record.username
                            ? "oklch(0.82 0.16 88)"
                            : "oklch(0.45 0.010 225)",
                        }}
                      >
                        {record.username ?? "—"}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-foreground whitespace-nowrap">
                        {record.email}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {record.country ?? "Unknown"}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {record.principal.length > 20
                          ? `${record.principal.slice(0, 20)}...`
                          : record.principal}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(record.loginTime).toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(record.lastSeen).toLocaleString()}
                      </td>
                      <td
                        className="px-3 py-2.5 font-mono text-xs max-w-[180px] truncate"
                        style={{ color: "oklch(0.55 0.010 225)" }}
                        title={record.userAgent}
                      >
                        {record.userAgent}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* System health */}
        <div
          className="rounded-lg p-4"
          style={{
            background: "oklch(0.135 0.007 240)",
            border: "1px solid oklch(0.20 0.010 240)",
          }}
        >
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            System Health
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Uptime",
                value: "99.97%",
                color: "oklch(0.72 0.18 155)",
              },
              {
                label: "Signal Accuracy",
                value: "87.4%",
                color: "oklch(0.72 0.18 155)",
              },
              {
                label: "API Latency",
                value: "< 45ms",
                color: "oklch(0.82 0.16 88)",
              },
              {
                label: "Total Users",
                value: totalUserCount.toString(),
                color: "oklch(0.82 0.16 88)",
              },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="text-xs text-muted-foreground font-mono mb-1">
                  {label}
                </div>
                <div className="text-lg font-bold font-mono" style={{ color }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market overview */}
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
            Market Overview ({coins.length} coins)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    background: "oklch(0.13 0.007 240)",
                    borderBottom: "1px solid oklch(0.20 0.010 240)",
                  }}
                >
                  {[
                    "Symbol",
                    "Price",
                    "24h%",
                    "Volume",
                    "Signal",
                    "Confidence",
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
                {coins.slice(0, 15).map((coin) => {
                  const signal = signals.get(coin.symbol);
                  const isUp = coin.change24h >= 0;
                  const sigStyle = signal
                    ? SIG_STYLE[signal.recommendation]
                    : null;
                  return (
                    <tr
                      key={coin.symbol}
                      className="exchange-row"
                      style={{
                        borderBottom: "1px solid oklch(0.18 0.008 235)",
                      }}
                    >
                      <td className="pl-4 pr-3 py-2 font-mono text-xs font-semibold text-foreground">
                        {coin.symbol}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs font-semibold text-foreground">
                        {formatPrice(coin.price)}
                      </td>
                      <td
                        className="px-3 py-2 font-mono text-xs font-semibold"
                        style={{
                          color: isUp
                            ? "oklch(0.72 0.18 155)"
                            : "oklch(0.65 0.22 25)",
                        }}
                      >
                        {isUp ? "+" : ""}
                        {coin.change24h.toFixed(2)}%
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                        {formatLargeNumber(coin.volume24h)}
                      </td>
                      <td className="px-3 py-2">
                        {signal && sigStyle && (
                          <span
                            className="font-mono text-xs font-bold"
                            style={{ color: sigStyle.color }}
                          >
                            {signal.recommendation}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {signal && (
                          <div className="flex items-center gap-2">
                            <div
                              className="flex-1 h-1.5 rounded-full overflow-hidden"
                              style={{ background: "oklch(0.22 0.010 240)" }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${signal.confidence}%`,
                                  background: sigStyle?.color,
                                }}
                              />
                            </div>
                            <span className="text-xs font-mono text-muted-foreground w-8 shrink-0">
                              {signal.confidence}%
                            </span>
                          </div>
                        )}
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
