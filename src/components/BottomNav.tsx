import {
  BarChart2,
  BriefcaseBusiness,
  LayoutGrid,
  MoreHorizontal,
  Star,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { type PageId, useAppStore } from "../store/appStore";

const FOUNDERS = [
  "Sohail Shaikh",
  "Adib Shaikh",
  "Gaurav Pal",
  "Ganesh Jadhav",
];

const MAIN_NAV: {
  id: PageId;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { id: "markets", icon: LayoutGrid, label: "Markets" },
  { id: "watchlist", icon: Star, label: "Watchlist" },
  { id: "portfolio", icon: BriefcaseBusiness, label: "Portfolio" },
  { id: "wallet", icon: Wallet, label: "Wallet" },
];

const MORE_NAV: { id: PageId; label: string }[] = [
  { id: "options", label: "Options" },
  { id: "intraday", label: "Intraday" },
  { id: "subscription", label: "Subscription" },
  { id: "admin", label: "Admin" },
  { id: "founders", label: "Founders" },
  { id: "about", label: "About" },
];

export function BottomNav() {
  const activePage = useAppStore((s) => s.activePage);
  const setActivePage = useAppStore((s) => s.setActivePage);
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = MORE_NAV.some((n) => n.id === activePage);

  return (
    <>
      {/* More drawer */}
      {showMore && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setShowMore(false)}
            aria-label="Close menu"
          />
          <div
            className="fixed left-0 right-0 z-50 md:hidden p-4 rounded-t-xl"
            style={{
              /* Sits above the bottom nav (64px) + iPhone home indicator */
              bottom: "calc(4rem + env(safe-area-inset-bottom))",
              background: "oklch(0.14 0.008 235)",
              border: "1px solid oklch(0.22 0.010 240)",
              borderBottom: "none",
            }}
          >
            <div className="text-xs text-muted-foreground font-mono mb-3">
              More Options
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MORE_NAV.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setActivePage(id);
                    setShowMore(false);
                  }}
                  className="py-3 rounded text-sm font-mono font-semibold transition-colors"
                  style={
                    activePage === id
                      ? {
                          background: "oklch(0.82 0.16 88 / 0.15)",
                          color: "oklch(0.82 0.16 88)",
                          border: "1px solid oklch(0.82 0.16 88 / 0.4)",
                        }
                      : {
                          background: "oklch(0.18 0.008 235)",
                          color: "oklch(0.70 0.010 225)",
                          border: "1px solid oklch(0.22 0.010 240)",
                        }
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Founders section */}
            <div
              className="mt-4 pt-3"
              style={{ borderTop: "1px solid oklch(0.22 0.010 240)" }}
            >
              <div
                className="text-[10px] font-mono font-semibold uppercase tracking-widest mb-2"
                style={{ color: "oklch(0.78 0.18 174)" }}
              >
                Founders
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                {FOUNDERS.map((name, i) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 px-2 py-1.5 rounded"
                    style={{
                      background: "oklch(0.78 0.18 174 / 0.07)",
                      border: "1px solid oklch(0.78 0.18 174 / 0.2)",
                    }}
                  >
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
                      style={{
                        background: "oklch(0.78 0.18 174 / 0.2)",
                        color: "oklch(0.78 0.18 174)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="text-[11px] font-mono"
                      style={{ color: "oklch(0.85 0.008 220)" }}
                    >
                      {name}
                    </span>
                  </div>
                ))}
              </div>
              <p
                className="text-[9px] font-mono text-center"
                style={{ color: "oklch(0.55 0.015 225)" }}
              >
                Students of AI &amp; Data Science (AI&amp;DS) 2nd Year
              </p>
            </div>
          </div>
        </>
      )}

      {/* Bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden"
        style={{
          background: "oklch(0.11 0.006 240)",
          borderTop: "1px solid oklch(0.20 0.010 240)",
          /* Reserve space for iPhone home indicator bar */
          paddingBottom: "env(safe-area-inset-bottom)",
          /* Reserve space for iPhone side notches */
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        {MAIN_NAV.map(({ id, icon: Icon, label }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActivePage(id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors h-16"
              style={
                isActive
                  ? { color: "oklch(0.82 0.16 88)" }
                  : { color: "oklch(0.50 0.010 225)" }
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-mono">{label}</span>
              {isActive && (
                <span
                  className="absolute bottom-0 w-8 h-0.5 rounded-t-full"
                  style={{ background: "oklch(0.82 0.16 88)" }}
                />
              )}
            </button>
          );
        })}
        {/* More */}
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors h-16"
          style={
            isMoreActive || showMore
              ? { color: "oklch(0.82 0.16 88)" }
              : { color: "oklch(0.50 0.010 225)" }
          }
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-mono">More</span>
        </button>
      </nav>
    </>
  );
}
