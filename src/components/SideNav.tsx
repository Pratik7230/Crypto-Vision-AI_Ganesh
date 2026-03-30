import {
  BarChart2,
  BriefcaseBusiness,
  CandlestickChart,
  Crown,
  Info,
  LayoutGrid,
  Menu,
  Shield,
  Star,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type PageId, useAppStore } from "../store/appStore";

const NAV_ITEMS: {
  id: PageId;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { id: "markets", icon: LayoutGrid, label: "Markets" },
  { id: "watchlist", icon: Star, label: "Watchlist" },
  { id: "portfolio", icon: BriefcaseBusiness, label: "Portfolio" },
  { id: "wallet", icon: Wallet, label: "Wallet" },
  { id: "options", icon: BarChart2, label: "Options" },
  { id: "intraday", icon: CandlestickChart, label: "Intraday" },
  { id: "subscription", icon: Crown, label: "Subscription" },
  { id: "admin", icon: Shield, label: "Admin" },
  { id: "founders", icon: Users, label: "Founders" },
  { id: "about", icon: Info, label: "About" },
];

const FOUNDERS = [
  "Sohail Shaikh",
  "Adib Shaikh",
  "Gaurav Pal",
  "Ganesh Jadhav",
];

export function SideNav() {
  const activePage = useAppStore((s) => s.activePage);
  const setActivePage = useAppStore((s) => s.setActivePage);
  const [foundersOpen, setFoundersOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!foundersOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setFoundersOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [foundersOpen]);

  return (
    <nav
      className="hidden md:flex flex-col w-16 shrink-0 items-center py-3 gap-1 relative"
      style={{
        background: "oklch(0.11 0.006 240)",
        borderRight: "1px solid oklch(0.20 0.010 240)",
      }}
    >
      {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
        const isActive = activePage === id;
        return (
          <button
            key={id}
            type="button"
            title={label}
            onClick={() => setActivePage(id)}
            className="group relative flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-all duration-150"
            style={
              isActive
                ? {
                    background: "oklch(0.82 0.16 88 / 0.12)",
                    color: "oklch(0.82 0.16 88)",
                  }
                : { background: "transparent", color: "oklch(0.50 0.010 225)" }
            }
          >
            <Icon className="w-5 h-5" />
            {/* Active indicator bar */}
            {isActive && (
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full"
                style={{ background: "oklch(0.82 0.16 88)" }}
              />
            )}
            {/* Hover tooltip */}
            <span
              className="absolute left-14 px-2 py-1 rounded text-xs font-mono whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
              style={{
                background: "oklch(0.18 0.008 235)",
                border: "1px solid oklch(0.25 0.010 240)",
                color: "oklch(0.85 0.008 220)",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}

      {/* Divider */}
      <div
        className="w-8 my-2 shrink-0"
        style={{
          height: "1px",
          background: "oklch(0.22 0.010 240)",
        }}
      />

      {/* Founders toggle button */}
      <div className="relative mt-auto pt-2">
        <button
          ref={buttonRef}
          type="button"
          title="About — Founders"
          onClick={() => setFoundersOpen((v) => !v)}
          className="group flex flex-col items-center justify-center w-12 rounded-lg py-2 transition-all duration-150"
          style={
            foundersOpen
              ? {
                  background: "oklch(0.78 0.18 174 / 0.15)",
                  color: "oklch(0.78 0.18 174)",
                  border: "1px solid oklch(0.78 0.18 174 / 0.4)",
                }
              : {
                  background: "oklch(0.16 0.010 240)",
                  color: "oklch(0.70 0.015 200)",
                  border: "1px solid oklch(0.25 0.012 240)",
                }
          }
        >
          <Menu className="w-5 h-5" />
          <span className="text-[8px] font-mono mt-0.5 leading-none">Team</span>
          {/* Hover tooltip (only when panel is closed) */}
          {!foundersOpen && (
            <span
              className="absolute left-14 px-2 py-1 rounded text-xs font-mono whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
              style={{
                background: "oklch(0.18 0.008 235)",
                border: "1px solid oklch(0.25 0.010 240)",
                color: "oklch(0.85 0.008 220)",
              }}
            >
              Founders
            </span>
          )}
        </button>

        {/* Founders panel — floats to the right */}
        {foundersOpen && (
          <div
            ref={panelRef}
            className="absolute bottom-0 left-14 z-50 w-64 rounded-xl p-4"
            style={{
              background: "oklch(0.14 0.012 240)",
              border: "1px solid oklch(0.28 0.018 200)",
              boxShadow:
                "0 8px 32px oklch(0 0 0 / 0.5), 0 0 0 1px oklch(0.78 0.18 174 / 0.08)",
            }}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setFoundersOpen(false)}
              className="absolute top-3 right-3 p-0.5 rounded transition-colors"
              style={{ color: "oklch(0.50 0.010 225)" }}
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* App name */}
            <div className="flex items-center gap-2 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/generated/crypto-vision-ai-logo.svg"
                alt="Crypto Vision AI"
                className="w-7 h-7"
              />
              <div>
                <div
                  className="font-mono font-bold text-xs tracking-wide"
                  style={{ color: "oklch(0.78 0.18 174)" }}
                >
                  Crypto Vision AI
                </div>
                <div
                  className="text-[9px] font-mono mt-0.5"
                  style={{ color: "oklch(0.50 0.010 225)" }}
                >
                  AI-Powered Market Intelligence
                </div>
              </div>
            </div>

            {/* Divider */}
            <div
              className="mb-3"
              style={{
                height: "1px",
                background: "oklch(0.22 0.010 240)",
              }}
            />

            {/* Founders */}
            <div
              className="text-[10px] font-mono font-semibold mb-2 uppercase tracking-widest"
              style={{ color: "oklch(0.55 0.015 225)" }}
            >
              Founders
            </div>
            <ul className="space-y-1.5 mb-3">
              {FOUNDERS.map((name, i) => (
                <li
                  key={name}
                  className="flex items-center gap-2.5 text-[11px] font-mono"
                  style={{ color: "oklch(0.85 0.008 220)" }}
                >
                  <span
                    className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{
                      background: "oklch(0.78 0.18 174 / 0.15)",
                      color: "oklch(0.78 0.18 174)",
                      border: "1px solid oklch(0.78 0.18 174 / 0.3)",
                    }}
                  >
                    {i + 1}
                  </span>
                  {name}
                </li>
              ))}
            </ul>

            {/* Divider */}
            <div
              className="mb-2"
              style={{
                height: "1px",
                background: "oklch(0.22 0.010 240)",
              }}
            />

            {/* Subtitle */}
            <p
              className="text-[9px] font-mono leading-relaxed"
              style={{ color: "oklch(0.55 0.015 225)" }}
            >
              Students of Artificial Intelligence &amp; Data Science
              <br />
              <span style={{ color: "oklch(0.78 0.18 174)" }}>AI&amp;DS</span>{" "}
              2nd Year
            </p>
          </div>
        )}
      </div>
    </nav>
  );
}

