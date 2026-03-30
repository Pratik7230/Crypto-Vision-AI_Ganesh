import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type SubscriptionPlan, useAppStore } from "../store/appStore";

interface PlanConfig {
  id: SubscriptionPlan;
  name: string;
  price: number;
  period: string;
  months: number;
  badge?: string;
  badgeStyle?: "popular" | "best";
  monthlyPrice?: string;
  savings?: string;
  color: string;
  borderColor: string;
  bgGlow: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
}

const PLANS: PlanConfig[] = [
  {
    id: "basic",
    name: "Basic",
    price: 40,
    period: "/ month",
    months: 1,
    color: "oklch(0.72 0.10 200)",
    borderColor: "oklch(0.72 0.10 200 / 0.35)",
    bgGlow: "oklch(0.72 0.10 200 / 0.05)",
    icon: Zap,
    features: [
      "Real-time AI signals (no delay)",
      "Track 15 coins",
      "Basic candlestick charts",
      "BUY / SELL / HOLD alerts",
      "Portfolio tracking",
      "Email notifications",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: 210,
    period: "/ 6 months",
    months: 6,
    badge: "Most Popular",
    badgeStyle: "popular",
    monthlyPrice: "$35",
    savings: "Save 12%",
    color: "oklch(0.78 0.18 174)",
    borderColor: "oklch(0.78 0.18 174 / 0.60)",
    bgGlow: "oklch(0.78 0.18 174 / 0.08)",
    icon: Sparkles,
    features: [
      "Everything in Basic",
      "Track all 31 coins",
      "Advanced candlestick charts",
      "Options trading access",
      "Intraday trading access",
      "Priority support",
      "Custom watchlist (50 coins)",
      "Performance analytics",
    ],
  },
  {
    id: "pro",
    name: "Pro Annual",
    price: 420,
    period: "/ year",
    months: 12,
    badge: "Best Value",
    badgeStyle: "best",
    monthlyPrice: "$35",
    savings: "Save 12%",
    color: "oklch(0.82 0.16 88)",
    borderColor: "oklch(0.82 0.16 88 / 0.55)",
    bgGlow: "oklch(0.82 0.16 88 / 0.07)",
    icon: Crown,
    features: [
      "Everything in Standard",
      "Unlimited coin tracking",
      "Premium AI predictions (98% accuracy)",
      "REST API access",
      "Dedicated account manager",
      "Backtesting tools",
      "Advanced market analytics",
      "Custom price alerts",
      "VIP 24/7 support",
    ],
  },
];

const FREE_LIMITS = [
  "Delayed signals (5 min lag)",
  "Track up to 5 coins only",
  "No options or intraday trading",
  "No advanced analytics",
  "Community support only",
];

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getPlanLabel(plan: SubscriptionPlan): string {
  switch (plan) {
    case "basic":
      return "Basic";
    case "standard":
      return "Standard";
    case "pro":
      return "Pro Annual";
    default:
      return "Free";
  }
}

export function SubscriptionPage() {
  const userSubscription = useAppStore((s) => s.userSubscription);
  const setSubscription = useAppStore((s) => s.setSubscription);
  const setActivePage = useAppStore((s) => s.setActivePage);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const nowMs = clock.getTime();

  const isActive = (plan: SubscriptionPlan) => {
    if (userSubscription.plan !== plan) return false;
    if (plan === "free") return true;
    if (!userSubscription.expiresAt) return false;
    return userSubscription.expiresAt > nowMs;
  };

  const handleSubscribe = (plan: PlanConfig) => {
    if (isActive(plan.id)) return;
    setSubscription(plan.id, plan.months);
    toast.success("🎉 Plan activated!", {
      description: `You now have ${plan.name} access. Enjoy your premium features!`,
      duration: 5000,
    });
  };

  return (
    <div
      data-ocid="subscription.page"
      className="flex flex-col h-full overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0"
      style={{ background: "oklch(0.10 0.005 240)" }}
    >
      {/* Active plan banner */}
      {userSubscription.plan !== "free" &&
        userSubscription.expiresAt &&
        userSubscription.expiresAt > nowMs && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-4 rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-mono"
            style={{
              background:
                userSubscription.plan === "pro"
                  ? "oklch(0.82 0.16 88 / 0.12)"
                  : userSubscription.plan === "standard"
                    ? "oklch(0.78 0.18 174 / 0.12)"
                    : "oklch(0.72 0.10 200 / 0.12)",
              border: `1px solid ${
                userSubscription.plan === "pro"
                  ? "oklch(0.82 0.16 88 / 0.40)"
                  : userSubscription.plan === "standard"
                    ? "oklch(0.78 0.18 174 / 0.40)"
                    : "oklch(0.72 0.10 200 / 0.40)"
              }`,
              color:
                userSubscription.plan === "pro"
                  ? "oklch(0.82 0.16 88)"
                  : userSubscription.plan === "standard"
                    ? "oklch(0.78 0.18 174)"
                    : "oklch(0.72 0.10 200)",
            }}
          >
            <Crown className="w-4 h-4 shrink-0" />
            <span>
              Your{" "}
              <span className="font-bold">
                {getPlanLabel(userSubscription.plan)}
              </span>{" "}
              plan is active until{" "}
              <span className="font-bold">
                {formatDate(userSubscription.expiresAt)}
              </span>
            </span>
          </motion.div>
        )}

      {/* Page header */}
      <div className="px-4 pt-8 pb-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: "oklch(0.82 0.16 88 / 0.15)",
                border: "1px solid oklch(0.82 0.16 88 / 0.4)",
              }}
            >
              <Crown
                className="w-4 h-4"
                style={{ color: "oklch(0.82 0.16 88)" }}
              />
            </div>
            <span
              className="text-xs font-mono font-bold uppercase tracking-widest"
              style={{ color: "oklch(0.82 0.16 88)" }}
            >
              Subscription Plans
            </span>
          </div>
          <h1
            className="text-3xl font-display font-bold mb-2"
            style={{ color: "oklch(0.93 0.008 220)" }}
          >
            Unlock Premium AI Trading
          </h1>
          <p
            className="text-sm font-mono max-w-lg mx-auto"
            style={{ color: "oklch(0.55 0.012 225)" }}
          >
            Get real-time AI signals, advanced charts, and professional trading
            tools. Upgrade your edge in the crypto market.
          </p>
        </motion.div>
      </div>

      {/* Plan cards */}
      <div className="px-4 pb-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto w-full">
        {PLANS.map((plan, idx) => {
          const PlanIcon = plan.icon;
          const active = isActive(plan.id);
          const isPopular = plan.badgeStyle === "popular";
          const isBest = plan.badgeStyle === "best";

          return (
            <motion.div
              key={plan.id}
              data-ocid={`subscription.${plan.id}.card`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative flex flex-col rounded-2xl overflow-hidden"
              style={{
                background: `linear-gradient(145deg, oklch(0.13 0.008 240), ${plan.bgGlow})`,
                border: `1px solid ${plan.borderColor}`,
                boxShadow: isPopular
                  ? "0 0 40px oklch(0.78 0.18 174 / 0.15), 0 4px 20px oklch(0 0 0 / 0.4)"
                  : isBest
                    ? "0 0 40px oklch(0.82 0.16 88 / 0.12), 0 4px 20px oklch(0 0 0 / 0.4)"
                    : "0 4px 20px oklch(0 0 0 / 0.3)",
                transform: isPopular ? "scale(1.03)" : "scale(1)",
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest"
                  style={{
                    background: isPopular
                      ? "oklch(0.78 0.18 174)"
                      : "oklch(0.82 0.16 88)",
                    color: isPopular
                      ? "oklch(0.10 0.005 240)"
                      : "oklch(0.10 0.005 240)",
                    boxShadow: `0 2px 12px ${isPopular ? "oklch(0.78 0.18 174 / 0.5)" : "oklch(0.82 0.16 88 / 0.5)"}`,
                  }}
                >
                  {plan.badge}
                </div>
              )}

              {/* Card header */}
              <div
                className="px-6 pt-8 pb-5"
                style={{ borderBottom: `1px solid ${plan.borderColor}` }}
              >
                {/* Icon + name */}
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `${plan.color.replace(")", " / 0.15)")}`,
                      border: `1px solid ${plan.color.replace(")", " / 0.3)")}`,
                      color: plan.color,
                    }}
                  >
                    <PlanIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div
                      className="font-display font-bold text-base leading-tight"
                      style={{ color: "oklch(0.93 0.008 220)" }}
                    >
                      {plan.name}
                    </div>
                    {active && (
                      <span
                        className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded"
                        style={{
                          background: `${plan.color.replace(")", " / 0.15)")}`,
                          color: plan.color,
                        }}
                      >
                        Current Plan
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-1">
                  <span
                    className="text-4xl font-display font-bold"
                    style={{ color: plan.color }}
                  >
                    ${plan.price}
                  </span>
                  <span
                    className="text-sm font-mono ml-1"
                    style={{ color: "oklch(0.55 0.012 225)" }}
                  >
                    {plan.period}
                  </span>
                </div>

                {/* Savings */}
                {plan.monthlyPrice && (
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-xs font-mono"
                      style={{ color: "oklch(0.65 0.012 225)" }}
                    >
                      {plan.monthlyPrice}/mo
                    </span>
                    {plan.savings && (
                      <span
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: "oklch(0.72 0.18 155 / 0.15)",
                          color: "oklch(0.72 0.18 155)",
                        }}
                      >
                        {plan.savings}
                      </span>
                    )}
                  </div>
                )}

                {/* Subscribe button */}
                <button
                  type="button"
                  data-ocid={`subscription.${plan.id}.button`}
                  onClick={() => handleSubscribe(plan)}
                  disabled={active}
                  className="w-full py-2.5 rounded-xl text-sm font-mono font-bold transition-all duration-200 mt-2"
                  style={
                    active
                      ? {
                          background: "oklch(0.18 0.008 235)",
                          color: "oklch(0.50 0.010 225)",
                          border: "1px solid oklch(0.25 0.012 240)",
                          cursor: "not-allowed",
                        }
                      : {
                          background: plan.color,
                          color: "oklch(0.10 0.005 240)",
                          border: "1px solid transparent",
                          boxShadow: `0 4px 16px ${plan.color.replace(")", " / 0.35)")}`,
                        }
                  }
                >
                  {active ? "✓ Current Plan" : "Subscribe Now"}
                </button>
              </div>

              {/* Features */}
              <div className="px-6 py-5 flex-1">
                <div
                  className="text-[10px] font-mono font-bold uppercase tracking-widest mb-3"
                  style={{ color: "oklch(0.55 0.012 225)" }}
                >
                  Includes
                </div>
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm font-mono"
                      style={{ color: "oklch(0.80 0.008 220)" }}
                    >
                      <span
                        className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: `${plan.color.replace(")", " / 0.15)")}`,
                        }}
                      >
                        <Check
                          className="w-2.5 h-2.5"
                          style={{ color: plan.color }}
                        />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Free plan section */}
      <div className="px-4 pb-8 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="rounded-xl p-5"
          style={{
            background: "oklch(0.12 0.006 240)",
            border: "1px solid oklch(0.22 0.010 240)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-mono font-bold"
                  style={{
                    background: "oklch(0.20 0.010 240)",
                    color: "oklch(0.60 0.010 225)",
                    border: "1px solid oklch(0.28 0.010 240)",
                  }}
                >
                  Free Plan
                </span>
                {userSubscription.plan === "free" && (
                  <span
                    className="text-xs font-mono"
                    style={{ color: "oklch(0.55 0.012 225)" }}
                  >
                    — your current plan
                  </span>
                )}
              </div>
              <p
                className="text-xs font-mono mb-3"
                style={{ color: "oklch(0.55 0.012 225)" }}
              >
                Limited access with the following restrictions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FREE_LIMITS.map((limit) => (
                  <div
                    key={limit}
                    className="flex items-center gap-2 text-xs font-mono"
                    style={{ color: "oklch(0.55 0.012 225)" }}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold"
                      style={{
                        background: "oklch(0.65 0.22 25 / 0.15)",
                        color: "oklch(0.65 0.22 25)",
                      }}
                    >
                      ✕
                    </span>
                    {limit}
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0">
              <button
                type="button"
                onClick={() => {
                  const firstPlan = document.querySelector(
                    '[data-ocid="subscription.basic.button"]',
                  );
                  if (firstPlan)
                    (firstPlan as HTMLElement).scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-mono font-bold transition-all duration-200 whitespace-nowrap"
                style={{
                  background: "oklch(0.78 0.18 174 / 0.12)",
                  color: "oklch(0.78 0.18 174)",
                  border: "1px solid oklch(0.78 0.18 174 / 0.35)",
                }}
              >
                Upgrade Now ↑
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upgrade prompt for locked pages */}
      <div className="px-4 pb-8 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="rounded-xl p-5 text-center"
          style={{
            background: "oklch(0.82 0.16 88 / 0.05)",
            border: "1px solid oklch(0.82 0.16 88 / 0.20)",
          }}
        >
          <p
            className="text-xs font-mono mb-2"
            style={{ color: "oklch(0.65 0.012 225)" }}
          >
            Options trading and Intraday tools require{" "}
            <span style={{ color: "oklch(0.78 0.18 174)" }}>Standard</span> or{" "}
            <span style={{ color: "oklch(0.82 0.16 88)" }}>Pro</span> plan.
          </p>
          <div
            className="flex items-center justify-center gap-4 text-[11px] font-mono"
            style={{ color: "oklch(0.55 0.012 225)" }}
          >
            <span>✓ 7-day free trial on all paid plans</span>
            <span>✓ Cancel anytime</span>
            <span>✓ Simulated trading environment</span>
          </div>
          <button
            type="button"
            onClick={() => setActivePage("options")}
            className="mt-4 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all duration-200"
            style={{
              background: "oklch(0.78 0.18 174 / 0.15)",
              color: "oklch(0.78 0.18 174)",
              border: "1px solid oklch(0.78 0.18 174 / 0.35)",
            }}
          >
            Preview Options Trading →
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default SubscriptionPage;
