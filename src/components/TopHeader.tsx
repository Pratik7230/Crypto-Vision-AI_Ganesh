import {
  Bell,
  Clock,
  Crown,
  Expand,
  LogOut,
  Menu,
  Shrink,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatPrice } from "../data/cryptoData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { type SubscriptionPlan, useAppStore } from "../store/appStore";
import { clearAuthSession } from "../utils/authSession";

function useLiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

interface TopHeaderProps {
  onMenuClick?: () => void;
}

function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const notificationFeed = useAppStore((s) => s.notificationFeed);
  const markNotificationsRead = useAppStore((s) => s.markNotificationsRead);

  useEffect(() => {
    markNotificationsRead();
  }, [markNotificationsRead]);

  const relativeTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1.5rem)] rounded-xl overflow-hidden shadow-2xl z-50"
      style={{
        background: "oklch(0.135 0.007 240)",
        border: "1px solid oklch(0.25 0.012 240)",
        boxShadow: "0 8px 40px oklch(0.05 0.005 240 / 0.9)",
      }}
      data-ocid="notifications.panel"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid oklch(0.22 0.010 240)" }}
      >
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" style={{ color: "oklch(0.82 0.16 88)" }} />
          <span className="text-sm font-semibold text-foreground">
            Market Alerts
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          data-ocid="notifications.close_button"
          className="p-1 rounded hover:bg-accent/30 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Notifications list */}
      <div className="max-h-72 overflow-y-auto">
        {notificationFeed.length === 0 ? (
          <div
            data-ocid="notifications.empty_state"
            className="flex flex-col items-center justify-center py-8 px-4 text-center gap-2"
          >
            <Bell
              className="w-8 h-8 opacity-20"
              style={{ color: "oklch(0.82 0.16 88)" }}
            />
            <p className="text-xs font-mono text-muted-foreground">
              No alerts yet. Market updates appear here.
            </p>
          </div>
        ) : (
          <div>
            {notificationFeed.slice(0, 20).map((notif, idx) => {
              const isBullish = notif.direction === "bullish";
              const color = isBullish
                ? "oklch(0.72 0.18 155)"
                : "oklch(0.65 0.22 25)";
              const bgColor = isBullish
                ? "oklch(0.72 0.18 155 / 0.07)"
                : "oklch(0.65 0.22 25 / 0.07)";
              return (
                <div
                  key={notif.id}
                  data-ocid={`notifications.item.${idx + 1}`}
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/5"
                  style={{
                    borderBottom: "1px solid oklch(0.18 0.008 235)",
                    background: bgColor,
                  }}
                >
                  {/* Direction icon */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: isBullish
                        ? "oklch(0.72 0.18 155 / 0.15)"
                        : "oklch(0.65 0.22 25 / 0.15)",
                    }}
                  >
                    {isBullish ? (
                      <TrendingUp className="w-4 h-4" style={{ color }} />
                    ) : (
                      <TrendingDown className="w-4 h-4" style={{ color }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">
                        {notif.symbol}
                      </span>
                      <span
                        className="font-mono text-sm font-bold"
                        style={{ color }}
                      >
                        {notif.change >= 0 ? "+" : ""}
                        {notif.change.toFixed(2)}%
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                        style={{
                          background: isBullish
                            ? "oklch(0.72 0.18 155 / 0.2)"
                            : "oklch(0.65 0.22 25 / 0.2)",
                          color,
                        }}
                      >
                        {isBullish ? "BULLISH" : "BEARISH"}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                      {relativeTime(notif.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{
          borderTop: "1px solid oklch(0.22 0.010 240)",
          background: "oklch(0.12 0.006 240)",
        }}
      >
        <span className="text-[11px] font-mono text-muted-foreground">
          Updates every 30s
        </span>
        <div
          className="flex items-center gap-1 text-[11px] font-mono"
          style={{ color: "oklch(0.72 0.18 155)" }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "oklch(0.72 0.18 155)" }}
          />
          LIVE
        </div>
      </div>
    </div>
  );
}

function getPlanBadgeStyle(
  plan: SubscriptionPlan,
): { label: string; color: string; bg: string; border: string } | null {
  switch (plan) {
    case "pro":
      return {
        label: "PRO",
        color: "oklch(0.82 0.16 88)",
        bg: "oklch(0.82 0.16 88 / 0.12)",
        border: "oklch(0.82 0.16 88 / 0.40)",
      };
    case "standard":
      return {
        label: "STANDARD",
        color: "oklch(0.78 0.18 174)",
        bg: "oklch(0.78 0.18 174 / 0.12)",
        border: "oklch(0.78 0.18 174 / 0.40)",
      };
    case "basic":
      return {
        label: "BASIC",
        color: "oklch(0.72 0.10 200)",
        bg: "oklch(0.72 0.10 200 / 0.12)",
        border: "oklch(0.72 0.10 200 / 0.40)",
      };
    default:
      return null;
  }
}

function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(
    !!document.fullscreenElement,
  );

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  return { isFullscreen, toggle };
}

export function TopHeader({ onMenuClick }: TopHeaderProps) {
  const { identity, clear } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString() ?? "";
  const coins = useAppStore((s) => s.coins);
  const notificationFeed = useAppStore((s) => s.notificationFeed);
  const userSubscription = useAppStore((s) => s.userSubscription);
  const setActivePage = useAppStore((s) => s.setActivePage);

  const planBadge = (() => {
    const badge = getPlanBadgeStyle(userSubscription.plan);
    if (!badge) return null;
    // Only show if not expired
    if (userSubscription.expiresAt && userSubscription.expiresAt <= Date.now())
      return null;
    return badge;
  })();
  const clock = useLiveClock();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

  const unreadCount = notificationFeed.filter((n) => !n.read).length;

  const handleLogout = () => {
    // Always clear local auth session (email/password login).
    clearAuthSession();

    // Only clear Internet Identity when an identity exists.
    if (identity) {
      clear();
    }
  };

  const truncate = (p: string) =>
    p.length > 12 ? `${p.slice(0, 6)}...${p.slice(-4)}` : p;

  const tickerCoins = coins.filter((c) =>
    ["BTC", "ETH", "SOL", "BNB", "DOGE", "AVAX",].includes(c.symbol),
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  return (
    <header
      className="sticky top-0 z-30 flex items-center px-3 gap-2 shrink-0"
      style={{
        background: "oklch(0.11 0.006 240)",
        borderBottom: "1px solid oklch(0.20 0.010 240)",
        /* Push content below the iOS status bar in standalone mode */
        paddingTop: "env(safe-area-inset-top)",
        /* Reserve space for iPhone side notches */
        paddingLeft: "calc(0.75rem + env(safe-area-inset-left))",
        paddingRight: "calc(0.75rem + env(safe-area-inset-right))",
        /* Minimum touch-target height + safe-area-inset-top */
        minHeight: "calc(3.5rem + env(safe-area-inset-top))",
      }}
    >
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={onMenuClick}
        className="p-1.5 rounded hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors md:hidden"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-2 shrink-0">
        <img
          src="/assets/generated/crypto-vision-ai-logo.svg"
          alt="Crypto Vision AI"
          className="w-10 h-10"
          style={{ filter: "drop-shadow(0 0 8px oklch(0.78 0.18 174 / 0.6))" }}
        />
        <div className="hidden sm:flex flex-col leading-tight">
          <span
            className="font-display font-bold text-base tracking-tight"
            style={{ color: "oklch(0.92 0.008 220)" }}
          >
            Crypto Vision{" "}
            <span style={{ color: "oklch(0.82 0.16 88)" }}>AI</span>
          </span>
          <span
            className="text-[9px] font-mono"
            style={{ color: "oklch(0.50 0.010 225)" }}
          >
            AI-Powered Market Intelligence
          </span>
        </div>
      </div>

      {/* Ticker strip */}
      <div className="flex-1 overflow-hidden hidden md:block mx-3">
        <div className="overflow-hidden h-full flex items-center">
          <div
            className="flex gap-6 whitespace-nowrap animate-ticker"
            style={{ width: "200%" }}
          >
            {[...tickerCoins, ...tickerCoins].map((coin, i) => {
              const isUp = coin.change24h >= 0;
              return (
                <span
                  key={`${coin.symbol}-${i}`}
                  className="inline-flex items-center gap-1.5 text-xs font-mono"
                >
                  <span className="text-foreground font-semibold">
                    {coin.symbol}
                  </span>
                  <span className="text-muted-foreground">
                    {formatPrice(coin.price)}
                  </span>
                  <span
                    style={{
                      color: isUp
                        ? "oklch(0.72 0.18 155)"
                        : "oklch(0.65 0.22 25)",
                    }}
                  >
                    {isUp ? "+" : ""}
                    {coin.change24h.toFixed(2)}%
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 ml-auto shrink-0">
        {/* Live indicator */}
        <div
          className="hidden sm:flex items-center gap-1 px-2 py-1 rounded text-xs font-mono"
          style={{
            background: "oklch(0.72 0.18 155 / 0.1)",
            border: "1px solid oklch(0.72 0.18 155 / 0.25)",
            color: "oklch(0.72 0.18 155)",
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "oklch(0.72 0.18 155)" }}
          />
          LIVE
        </div>

        {/* Clock */}
        <div className="hidden lg:flex items-center gap-1 text-xs font-mono text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          {clock.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>

        {/* Fullscreen toggle */}
        <button
          type="button"
          data-ocid="header.fullscreen_button"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className="p-1.5 rounded hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          {isFullscreen ? (
            <Shrink className="w-4 h-4" />
          ) : (
            <Expand className="w-4 h-4" />
          )}
        </button>

        {/* Notifications bell */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            data-ocid="notifications.toggle"
            onClick={() => setShowNotifications((v) => !v)}
            className="p-1.5 rounded hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 ? (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold px-0.5"
                style={{
                  background: "oklch(0.65 0.22 40)",
                  color: "oklch(0.97 0.01 40)",
                  lineHeight: 1,
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : (
              <span
                className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                style={{ background: "oklch(0.82 0.16 88)" }}
              />
            )}
          </button>

          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Subscription plan badge */}
        {planBadge ? (
          <button
            type="button"
            onClick={() => setActivePage("subscription")}
            className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-200 hover:opacity-80"
            style={{
              background: planBadge.bg,
              border: `1px solid ${planBadge.border}`,
              color: planBadge.color,
            }}
          >
            <Crown className="w-3 h-3" />
            {planBadge.label}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setActivePage("subscription")}
            className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-200 hover:opacity-80"
            style={{
              background: "oklch(0.16 0.008 235)",
              border: "1px solid oklch(0.22 0.010 240)",
              color: "oklch(0.55 0.012 225)",
            }}
          >
            <Crown className="w-3 h-3" />
            Upgrade
          </button>
        )}

        {/* Principal badge */}
        {principal && (
          <div
            className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded font-mono text-xs"
            style={{
              background: "oklch(0.16 0.008 235)",
              border: "1px solid oklch(0.22 0.010 240)",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "oklch(0.82 0.16 88)" }}
            />
            <span className="text-muted-foreground">{truncate(principal)}</span>
          </div>
        )}

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-all duration-200"
          style={{
            background: "oklch(0.62 0.22 25 / 0.1)",
            border: "1px solid oklch(0.62 0.22 25 / 0.25)",
            color: "oklch(0.72 0.15 25)",
          }}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

