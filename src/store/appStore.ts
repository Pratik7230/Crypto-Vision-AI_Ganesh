import { toast } from "sonner";
import { create } from "zustand";
import {
  type AISignal,
  type Coin,
  computeSignal,
  fluctuatePrices,
  initializeCoins,
} from "../data/cryptoData";
import { INITIAL_POSITIONS, type Position } from "../data/portfolioData";

export type PageId =
  | "markets"
  | "watchlist"
  | "portfolio"
  | "wallet"
  | "options"
  | "intraday"
  | "admin"
  | "founders"
  | "about"
  | "subscription";

export type UserLoginRecord = {
  id: string;
  email: string;
  principal: string;
  loginTime: number;
  lastSeen: number;
  userAgent: string;
  country?: string;
  username?: string;
  phone?: string;
  dialCode?: string;
  demoBalance?: number;
};

export type MarketNotification = {
  id: string;
  symbol: string;
  change: number;
  direction: "bullish" | "bearish";
  timestamp: number;
  read: boolean;
};

const STORAGE_KEY = "cvai_login_log";
const MAX_LOGIN_RECORDS = 200;

const SUBSCRIPTION_KEY = "cvai_subscription";

export type SubscriptionPlan = "free" | "basic" | "standard" | "pro";

export interface UserSubscription {
  plan: SubscriptionPlan;
  expiresAt: number | null;
}

function loadSubscription(): UserSubscription {
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_KEY);
    if (!raw) return { plan: "free", expiresAt: null };
    return JSON.parse(raw) as UserSubscription;
  } catch {
    return { plan: "free", expiresAt: null };
  }
}

function saveSubscription(sub: UserSubscription): void {
  try {
    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(sub));
  } catch {
    // ignore storage errors
  }
}

function loadLoginLog(): UserLoginRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UserLoginRecord[];
  } catch {
    return [];
  }
}

function saveLoginLog(records: UserLoginRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore storage errors
  }
}

interface AppState {
  // Navigation
  activePage: PageId;
  setActivePage: (page: PageId) => void;

  // Market data
  coins: Coin[];
  signals: Map<string, AISignal>;
  signalFeed: AISignal[];
  lastRefresh: number;
  isFirstRefresh: boolean;
  refreshMarket: () => void;
  startAutoRefresh: () => () => void;

  // Watchlist
  watchlist: Set<string>;
  toggleWatchlist: (symbol: string) => void;

  // Portfolio positions
  positions: Position[];
  removePosition: (symbol: string) => void;

  // Admin auth
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => boolean;
  adminLogout: () => void;

  // User login log
  userLoginLog: UserLoginRecord[];
  addUserLoginRecord: (record: UserLoginRecord) => void;

  // Notification feed
  notificationFeed: MarketNotification[];
  markNotificationsRead: () => void;

  // Subscription
  userSubscription: UserSubscription;
  setSubscription: (plan: SubscriptionPlan, months: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activePage: "markets",
  setActivePage: (page) => set({ activePage: page }),

  coins: initializeCoins(),
  signals: (() => {
    const coins = initializeCoins();
    const map = new Map<string, AISignal>();
    for (const coin of coins) map.set(coin.symbol, computeSignal(coin));
    return map;
  })(),
  signalFeed: (() => {
    const coins = initializeCoins();
    return coins.map((coin) => ({
      ...computeSignal(coin),
      timestamp: Date.now() - Math.floor(Math.random() * 300_000),
    }));
  })(),
  lastRefresh: Date.now(),
  isFirstRefresh: true,

  refreshMarket: () => {
    const { coins, signals: prevSignals, isFirstRefresh } = get();
    const newCoins = fluctuatePrices(coins);
    const newSignals = new Map<string, AISignal>();
    const updates: AISignal[] = [];
    const newNotifications: MarketNotification[] = [];

    for (const coin of newCoins) {
      const sig = computeSignal(coin);
      newSignals.set(coin.symbol, sig);
      if (Math.random() < 0.4) updates.push({ ...sig, timestamp: Date.now() });
    }

    // Fire BUY/SELL direction notifications on signal changes (not on first load)
    if (!isFirstRefresh) {
      let notificationCount = 0;
      for (const [symbol, newSig] of newSignals) {
        if (notificationCount >= 3) break;
        const prevSig = prevSignals.get(symbol);
        if (!prevSig) continue;
        if (prevSig.recommendation === newSig.recommendation) continue;

        const rec = newSig.recommendation;
        if (rec === "BUY") {
          const desc = `↑ Upside detected — ${newSig.reasoning.slice(0, 80)}`;
          toast.success(`🚀 BUY Signal: ${symbol}`, {
            description: desc,
            duration: 6000,
          });
          notificationCount++;
        } else if (rec === "SELL") {
          const desc = `↓ Downside detected — ${newSig.reasoning.slice(0, 80)}`;
          toast.error(`⚠️ SELL Signal: ${symbol}`, {
            description: desc,
            duration: 6000,
          });
          notificationCount++;
        }
      }

      // Build bell notifications from coins that moved >2%
      let bellCount = 0;
      for (const coin of newCoins) {
        if (bellCount >= 5) break;
        const absChange = Math.abs(coin.change24h);
        if (absChange >= 2) {
          newNotifications.push({
            id: `${coin.symbol}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            symbol: coin.symbol,
            change: coin.change24h,
            direction: coin.change24h >= 0 ? "bullish" : "bearish",
            timestamp: Date.now(),
            read: false,
          });
          bellCount++;
        }
      }
    }

    set((state) => ({
      coins: newCoins,
      signals: newSignals,
      signalFeed:
        updates.length > 0
          ? [...updates, ...state.signalFeed].slice(0, 50)
          : state.signalFeed,
      lastRefresh: Date.now(),
      isFirstRefresh: false,
      notificationFeed:
        newNotifications.length > 0
          ? [...newNotifications, ...state.notificationFeed].slice(0, 50)
          : state.notificationFeed,
    }));
  },

  startAutoRefresh: () => {
    const id = setInterval(() => get().refreshMarket(), 30_000);
    return () => clearInterval(id);
  },

  watchlist: new Set(["BTC", "ETH", "SOL"]),
  toggleWatchlist: (symbol) => {
    set((state) => {
      const next = new Set(state.watchlist);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      return { watchlist: next };
    });
  },

  positions: [...INITIAL_POSITIONS],
  removePosition: (symbol) => {
    set((state) => ({
      positions: state.positions.filter((p) => p.symbol !== symbol),
    }));
  },

  // Admin auth
  isAdminAuthenticated: false,
  adminLogin: (email: string, password: string): boolean => {
    if (email === "founder@access.com" && password === "founder@123") {
      set({ isAdminAuthenticated: true });
      return true;
    }
    return false;
  },
  adminLogout: () => set({ isAdminAuthenticated: false }),

  // User login log — initialised from localStorage
  userLoginLog: loadLoginLog(),
  addUserLoginRecord: (record: UserLoginRecord) => {
    set((state) => {
      // Check if this principal already has a record; if so update lastSeen + profile fields
      const existing = state.userLoginLog.findIndex(
        (r) => r.principal === record.principal,
      );
      let updated: UserLoginRecord[];
      if (existing !== -1) {
        updated = state.userLoginLog.map((r, i) =>
          i === existing
            ? {
                ...r,
                lastSeen: record.lastSeen,
                // Update profile fields if provided in new record
                ...(record.username ? { username: record.username } : {}),
                ...(record.phone ? { phone: record.phone } : {}),
                ...(record.dialCode ? { dialCode: record.dialCode } : {}),
                ...(record.demoBalance !== undefined
                  ? { demoBalance: record.demoBalance }
                  : {}),
                ...(record.country ? { country: record.country } : {}),
              }
            : r,
        );
      } else {
        updated = [record, ...state.userLoginLog].slice(0, MAX_LOGIN_RECORDS);
      }
      saveLoginLog(updated);
      return { userLoginLog: updated };
    });
  },

  // Notification feed
  notificationFeed: [],
  markNotificationsRead: () => {
    set((state) => ({
      notificationFeed: state.notificationFeed.map((n) => ({
        ...n,
        read: true,
      })),
    }));
  },

  // Subscription
  userSubscription: loadSubscription(),
  setSubscription: (plan: SubscriptionPlan, months: number) => {
    const now = Date.now();
    const expiresAt =
      plan === "free" ? null : now + months * 30 * 24 * 60 * 60 * 1000;
    const sub: UserSubscription = { plan, expiresAt };
    saveSubscription(sub);
    set({ userSubscription: sub });
  },
}));
