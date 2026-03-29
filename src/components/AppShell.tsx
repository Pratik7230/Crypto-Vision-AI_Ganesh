import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { AboutPage } from "../pages/AboutPage";
import { AdminPage } from "../pages/AdminPage";
import { FoundersPage } from "../pages/FoundersPage";
import { IntradayPage } from "../pages/IntradayPage";
import { MarketsPage } from "../pages/MarketsPage";
import { OptionsPage } from "../pages/OptionsPage";
import { PortfolioPage } from "../pages/PortfolioPage";
import { SubscriptionPage } from "../pages/SubscriptionPage";
import { WalletPage } from "../pages/WalletPage";
import { WatchlistPage } from "../pages/WatchlistPage";
import { useAppStore } from "../store/appStore";
import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";
import { TopHeader } from "./TopHeader";

function PageContent() {
  const activePage = useAppStore((s) => s.activePage);

  switch (activePage) {
    case "markets":
      return <MarketsPage />;
    case "watchlist":
      return <WatchlistPage />;
    case "portfolio":
      return <PortfolioPage />;
    case "wallet":
      return <WalletPage />;
    case "options":
      return <OptionsPage />;
    case "intraday":
      return <IntradayPage />;
    case "admin":
      return <AdminPage />;
    case "founders":
      return <FoundersPage />;
    case "about":
      return <AboutPage />;
    case "subscription":
      return <SubscriptionPage />;
    default:
      return <MarketsPage />;
  }
}

export function AppShell() {
  const startAutoRefresh = useAppStore((s) => s.startAutoRefresh);

  // Start the auto-refresh on mount
  useEffect(() => {
    const stop = startAutoRefresh();
    return stop;
  }, [startAutoRefresh]);

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        background: "oklch(0.10 0.005 240)",
        /* Use dynamic viewport height so iOS Safari address bar is accounted for */
        height: "100dvh",
      }}
    >
      <Toaster />

      {/* Top header */}
      <TopHeader />

      {/* Body: sidebar + main content */}
      <div className="flex flex-1 overflow-hidden">
        <SideNav />

        {/* Main content — flex column, clips horizontally, scrolls via each page */}
        <main
          className="flex-1 overflow-hidden flex flex-col"
          style={{ background: "oklch(0.10 0.005 240)" }}
        >
          <PageContent />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Footer */}
      <footer
        className="shrink-0 text-center py-2 text-[10px] text-muted-foreground font-mono hidden md:block"
        style={{ borderTop: "1px solid oklch(0.18 0.008 235)" }}
      >
        © {new Date().getFullYear()} Crypto Vision AI · Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "oklch(0.82 0.16 88)" }}
          className="hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
