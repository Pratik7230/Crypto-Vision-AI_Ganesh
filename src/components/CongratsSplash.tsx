import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface CongratsSplashProps {
  amount: number;
  username?: string;
  onDismiss: () => void;
}

function Sparkle({
  style,
}: {
  style: React.CSSProperties;
}) {
  return (
    <div
      className="absolute w-1.5 h-1.5 rounded-full animate-sparkle"
      style={style}
    />
  );
}

const SPARKLES = [
  { top: "10%", left: "12%", background: "#22c55e", animationDelay: "0s" },
  { top: "15%", right: "10%", background: "#f59e0b", animationDelay: "0.3s" },
  { top: "25%", left: "5%", background: "#06b6d4", animationDelay: "0.6s" },
  { top: "35%", right: "6%", background: "#22c55e", animationDelay: "0.9s" },
  { top: "60%", left: "8%", background: "#f59e0b", animationDelay: "0.2s" },
  { top: "70%", right: "9%", background: "#06b6d4", animationDelay: "0.5s" },
  { top: "80%", left: "15%", background: "#22c55e", animationDelay: "0.8s" },
  { top: "85%", right: "14%", background: "#f59e0b", animationDelay: "0.1s" },
  { top: "5%", left: "40%", background: "#a78bfa", animationDelay: "0.4s" },
  { top: "90%", left: "45%", background: "#22c55e", animationDelay: "0.7s" },
  { top: "20%", left: "25%", background: "#f59e0b", animationDelay: "1.1s" },
  { top: "75%", right: "25%", background: "#06b6d4", animationDelay: "1.3s" },
];

export function CongratsSplash({
  amount,
  username,
  onDismiss,
}: CongratsSplashProps) {
  const [progress, setProgress] = useState(100);
  const DURATION = 5000;

  useEffect(() => {
    const startTime = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
      if (elapsed >= DURATION) {
        clearInterval(id);
        onDismiss();
      }
    }, 50);
    return () => clearInterval(id);
  }, [onDismiss]);

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
        style={{ background: "oklch(0.07 0.005 240 / 0.98)" }}
        data-ocid="congrats.modal"
      >
        {/* Sparkle particles */}
        {SPARKLES.map((s) => (
          <Sparkle
            key={`${String(s.top ?? "")}-${String((s as { left?: string }).left ?? (s as { right?: string }).right ?? "")}-${s.background}`}
            style={s}
          />
        ))}

        {/* Card */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="relative w-full max-w-sm rounded-2xl overflow-hidden text-center"
          style={{
            background: "oklch(0.135 0.007 240)",
            border: "1px solid oklch(0.30 0.015 155 / 0.5)",
            boxShadow:
              "0 32px 80px oklch(0.05 0.005 240 / 0.9), 0 0 80px oklch(0.72 0.18 155 / 0.12)",
          }}
        >
          {/* Gradient top */}
          <div
            className="h-1.5 w-full"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.72 0.18 155), oklch(0.78 0.18 174), oklch(0.82 0.16 88), oklch(0.72 0.18 155))",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s linear infinite",
            }}
          />

          <div className="p-8 flex flex-col items-center gap-5">
            {/* Logo */}
            <motion.img
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.7,
                type: "spring",
                bounce: 0.5,
              }}
              src="/assets/generated/crypto-vision-ai-logo.svg"
              alt="Crypto Vision AI"
              className="w-20 h-20"
              style={{
                filter:
                  "drop-shadow(0 0 24px oklch(0.72 0.18 155 / 0.6)) drop-shadow(0 0 48px oklch(0.82 0.16 88 / 0.3))",
              }}
            />

            {/* Congrats text */}
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="text-4xl"
              >
                🎉
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="font-display font-bold text-2xl tracking-tight"
                style={{ color: "oklch(0.92 0.008 220)" }}
              >
                Congratulations{username ? `, ${username}!` : "!"}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-sm font-mono"
                style={{ color: "oklch(0.60 0.010 225)" }}
              >
                You have received a demo trading balance of
              </motion.p>
            </div>

            {/* Amount */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.7,
                duration: 0.5,
                type: "spring",
                bounce: 0.4,
              }}
              className="font-display font-black text-5xl tracking-tight"
              style={{
                color: "oklch(0.72 0.18 155)",
                textShadow: "0 0 40px oklch(0.72 0.18 155 / 0.5)",
              }}
            >
              {formattedAmount}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="text-xs font-mono text-center"
              style={{ color: "oklch(0.55 0.012 225)" }}
            >
              Use this balance to practice trading strategies
              <br />
              without any real risk
            </motion.p>

            {/* CTA button */}
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              type="button"
              onClick={onDismiss}
              data-ocid="congrats.start_button"
              className="w-full py-3.5 rounded-xl text-sm font-mono font-bold transition-all duration-200"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.78 0.18 174), oklch(0.72 0.18 155))",
                color: "oklch(0.07 0.005 155)",
                boxShadow: "0 4px 20px oklch(0.72 0.18 155 / 0.35)",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🚀 Start Trading
            </motion.button>

            {/* Auto-dismiss progress */}
            <div className="w-full space-y-1">
              <div
                className="w-full h-1 rounded-full overflow-hidden"
                style={{ background: "oklch(0.22 0.010 240)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-50"
                  style={{
                    width: `${progress}%`,
                    background: "oklch(0.72 0.18 155 / 0.6)",
                  }}
                />
              </div>
              <p
                className="text-[10px] font-mono text-center"
                style={{ color: "oklch(0.45 0.010 225)" }}
              >
                Auto-continues in {Math.ceil((progress / 100) * 5)}s
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

