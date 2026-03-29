import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Coin {
    change24h: number;
    marketCap: number;
    name: string;
    volume24h: number;
    updatedAt: bigint;
    price: number;
    symbol: string;
}
export interface UserProfile {
    country: string;
    username: string;
    phone: string;
    demoBalance: bigint;
    hasCompletedOnboarding: boolean;
}
export interface AISignal {
    coinSymbol: string;
    reasoning: string;
    timestamp: bigint;
    recommendation: Recommendation;
    confidence: bigint;
}
export enum Recommendation {
    buy = "buy",
    hold = "hold",
    sell = "sell"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addToWatchlist(symbol: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAISignalForCoin(symbol: string): Promise<AISignal | null>;
    getAISignals(): Promise<Array<AISignal>>;
    getAllUserProfiles(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCoinDetail(symbol: string): Promise<Coin | null>;
    getCoinList(): Promise<Array<Coin>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserWatchlist(): Promise<Array<string>>;
    isCallerAdmin(): Promise<boolean>;
    removeFromWatchlist(symbol: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
