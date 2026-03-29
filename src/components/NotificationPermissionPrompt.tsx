import { Bell, BellOff, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

interface NotificationPermissionPromptProps {
  onClose: () => void;
}

export function NotificationPermissionPrompt({
  onClose,
}: NotificationPermissionPromptProps) {
  const handleAllow = async () => {
    try {
      if ("Notification" in window) {
        await Notification.requestPermission();
      }
    } catch {
      // ignore
    }
    onClose();
  };

  const handleLater = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "oklch(0.07 0.005 240 / 0.95)" }}
      data-ocid="notif-prompt.modal"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "oklch(0.135 0.007 240)",
          border: "1px solid oklch(0.25 0.012 240)",
          boxShadow:
            "0 24px 80px oklch(0.05 0.005 240 / 0.9), 0 0 60px oklch(0.82 0.16 88 / 0.08)",
        }}
      >
        {/* Top bar */}
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.82 0.16 88), oklch(0.78 0.18 174))",
          }}
        />

        <div className="p-8 flex flex-col items-center gap-6 text-center">
          {/* Icon cluster */}
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "oklch(0.82 0.16 88 / 0.12)",
                border: "1px solid oklch(0.82 0.16 88 / 0.3)",
              }}
            >
              <Bell
                className="w-9 h-9"
                style={{ color: "oklch(0.82 0.16 88)" }}
              />
            </div>
            {/* floating badges */}
            <div
              className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: "oklch(0.72 0.18 155 / 0.15)",
                border: "1px solid oklch(0.72 0.18 155 / 0.4)",
              }}
            >
              <TrendingUp
                className="w-4 h-4"
                style={{ color: "oklch(0.72 0.18 155)" }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h2
              className="font-display font-bold text-xl tracking-tight"
              style={{ color: "oklch(0.92 0.008 220)" }}
            >
              Enable Notifications
            </h2>
            <p
              className="text-sm font-mono leading-relaxed"
              style={{ color: "oklch(0.58 0.010 225)" }}
            >
              Allow{" "}
              <span style={{ color: "oklch(0.82 0.16 88)" }}>
                Crypto Vision AI
              </span>{" "}
              to send you real-time market alerts and trade signals so you never
              miss a move.
            </p>
          </div>

          {/* Example alerts preview */}
          <div
            className="w-full rounded-xl p-3 space-y-2 text-left"
            style={{
              background: "oklch(0.105 0.006 240)",
              border: "1px solid oklch(0.20 0.010 240)",
            }}
          >
            {[
              {
                icon: "🚀",
                text: "BTC +5.2% — Strong BUY signal detected",
                color: "oklch(0.72 0.18 155)",
              },
              {
                icon: "⚠️",
                text: "ETH -3.1% — SELL signal, caution advised",
                color: "oklch(0.65 0.22 25)",
              },
            ].map(({ icon, text, color }) => (
              <div
                key={text}
                className="flex items-center gap-2 text-xs font-mono"
              >
                <span>{icon}</span>
                <span style={{ color }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="w-full space-y-3">
            <button
              type="button"
              onClick={handleAllow}
              data-ocid="notif-prompt.allow_button"
              className="w-full py-3.5 rounded-xl text-sm font-mono font-bold transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.82 0.16 88), oklch(0.78 0.18 174))",
                color: "oklch(0.10 0.005 240)",
                boxShadow: "0 4px 20px oklch(0.82 0.16 88 / 0.3)",
              }}
            >
              <Bell className="w-4 h-4" />
              Allow Notifications
            </button>
            <button
              type="button"
              onClick={handleLater}
              data-ocid="notif-prompt.skip_button"
              className="w-full py-2.5 rounded-xl text-sm font-mono transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: "transparent",
                border: "1px solid oklch(0.22 0.010 240)",
                color: "oklch(0.55 0.012 225)",
              }}
            >
              <BellOff className="w-4 h-4" />
              Maybe Later
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
