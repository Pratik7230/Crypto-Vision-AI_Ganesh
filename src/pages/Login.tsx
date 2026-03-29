import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  BarChart3,
  Brain,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SiApple, SiGoogle } from "react-icons/si";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { setAuthSession } from "../utils/authSession";

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Signals",
    desc: "Machine learning models analyze 200+ market indicators to generate precise BUY/SELL/HOLD recommendations.",
  },
  {
    icon: Zap,
    title: "Real-Time Intelligence",
    desc: "Price feeds update every 30 seconds. Signals recalculate on every tick — no stale data, ever.",
  },
  {
    icon: BarChart3,
    title: "31 Cryptocurrencies",
    desc: "Major coins, altcoins, digital stablecoins, and meme coins — all with real-time AI signals.",
  },
  {
    icon: TrendingUp,
    title: "Confidence Scoring",
    desc: "Every signal comes with a 0-100 confidence rating and detailed reasoning for full transparency.",
  },
];

const TICKERS = [
  { sym: "BTC", price: "$67,432", chg: "+4.2%", up: true },
  { sym: "ETH", price: "$3,512", chg: "+2.8%", up: true },
  { sym: "SOL", price: "$178.40", chg: "+6.7%", up: true },
  { sym: "XRP", price: "$0.6180", chg: "-4.1%", up: false },
  { sym: "BNB", price: "$598.00", chg: "-1.4%", up: false },
  { sym: "DOGE", price: "$0.1650", chg: "-5.3%", up: false },
  { sym: "AVAX", price: "$37.80", chg: "+3.9%", up: true },
  { sym: "LINK", price: "$17.50", chg: "+5.1%", up: true },
  { sym: "MATIC", price: "$0.8800", chg: "-2.1%", up: false },
  { sym: "DOT", price: "$8.72", chg: "+0.8%", up: true },
];

export function Login() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [forgotMode, setForgotMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  const isLoading = isLoggingIn || isInitializing || isAuthSubmitting;

  const authMode = forgotMode ? "forgot" : activeTab;

  function resetOtpFlow() {
    setOtp("");
    setOtpRequested(false);
    setFormError("");
    setInfoMessage("");
  }

  function switchTab(tab: "signin" | "signup") {
    setActiveTab(tab);
    setForgotMode(false);
    resetOtpFlow();
  }

  async function requestOtp(purpose: "signup" | "reset") {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setFormError("Please enter your email first");
      return false;
    }

    const response = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: normalizedEmail,
        purpose,
      }),
    });

    const data = (await response.json()) as {
      error?: string;
      message?: string;
      devOtp?: string;
    };

    if (!response.ok) {
      setFormError(data.error || "Unable to send OTP");
      return false;
    }

    setOtpRequested(true);
    setInfoMessage(
      data.devOtp
        ? `OTP sent. Dev OTP: ${data.devOtp}`
        : "OTP sent to your email",
    );
    return true;
  }

  async function handleEmailAuth() {
    setFormError("");
    setInfoMessage("");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      setFormError("Email and password are required");
      return;
    }

    if (authMode !== "signin" && normalizedPassword.length < 8) {
      setFormError("Password must be at least 8 characters");
      return;
    }

    let endpoint = "/api/auth/login";
    let payload: { email: string; password: string; otp?: string } = {
      email: normalizedEmail,
      password: normalizedPassword,
    };

    if (authMode === "signup") {
      if (!otpRequested) {
        await requestOtp("signup");
        return;
      }
      if (!otp.trim()) {
        setFormError("Please enter the OTP");
        return;
      }
      endpoint = "/api/auth/signup-otp";
      payload = { ...payload, otp: otp.trim() };
    }

    if (authMode === "forgot") {
      if (!otpRequested) {
        await requestOtp("reset");
        return;
      }
      if (!otp.trim()) {
        setFormError("Please enter the OTP");
        return;
      }
      endpoint = "/api/auth/forgot-password";
      payload = { ...payload, otp: otp.trim() };
    }

    try {
      setIsAuthSubmitting(true);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        error?: string;
        token?: string;
        user?: {
          id: string;
          email: string;
        };
      };

      if (!response.ok || !data.token || !data.user) {
        setFormError(data.error || "Authentication failed");
        return;
      }

      setAuthSession({
        token: data.token,
        user: data.user,
      });

      localStorage.setItem("cvai_user_email", data.user.email);
      setPassword("");
      resetOtpFlow();
      setForgotMode(false);
      setActiveTab("signin");
    } catch {
      setFormError("Unable to connect to server. Please try again.");
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  return (
    <div
      className="flex flex-col terminal-grid scanline relative overflow-y-auto"
      style={{
        background: "oklch(0.11 0.008 240)",
        /* Dynamic viewport height — shrinks when iOS address bar shows */
        minHeight: "100dvh",
        /* Respect iPhone notch/home indicator on all sides */
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.78 0.18 174) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.82 0.16 88) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
        <div
          className="absolute top-0 right-1/4 w-[300px] h-[300px] rounded-full opacity-8"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.72 0.18 155) 0%, transparent 70%)",
            filter: "blur(70px)",
          }}
        />
      </div>

      {/* Ticker tape */}
      <div
        className="relative z-10 overflow-hidden py-2"
        style={{
          background: "oklch(0.14 0.01 235)",
          borderBottom: "1px solid oklch(0.22 0.012 240)",
        }}
      >
        <div
          className="flex gap-8 animate-ticker whitespace-nowrap"
          style={{ width: "200%" }}
        >
          {[
            ...TICKERS.map((t) => ({ ...t, _key: `a-${t.sym}` })),
            ...TICKERS.map((t) => ({ ...t, _key: `b-${t.sym}` })),
          ].map(({ sym, price, chg, up, _key }) => (
            <span
              key={_key}
              className="inline-flex items-center gap-2 text-xs font-mono"
            >
              <span className="text-terminal-cyan font-bold">{sym}</span>
              <span className="text-foreground">{price}</span>
              <span
                className={up ? "text-terminal-green" : "text-terminal-red"}
              >
                {chg}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <nav
        className="relative z-10 flex items-center justify-between px-6 md:px-12 py-4"
        style={{ borderBottom: "1px solid oklch(0.18 0.01 235)" }}
      >
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/crypto-vision-ai-logo.svg"
            alt="Crypto Vision AI Logo"
            className="w-10 h-10 drop-shadow-[0_0_8px_oklch(0.78_0.18_174/0.8)]"
          />
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg tracking-tight text-foreground leading-tight">
              Crypto Vision <span className="text-terminal-cyan">AI</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-mono leading-tight tracking-widest uppercase">
              AI-Powered Market Intelligence
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Activity className="w-3.5 h-3.5 text-terminal-green animate-pulse" />
          <span>MARKETS OPEN</span>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 px-6 py-12">
        {/* Left: Hero text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left max-w-lg"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold mb-6"
            style={{
              background: "oklch(0.78 0.18 174 / 0.1)",
              border: "1px solid oklch(0.78 0.18 174 / 0.3)",
              color: "oklch(0.78 0.18 174)",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-terminal-cyan animate-pulse" />
            AI-Powered • Real-Time • Precision Signals
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4"
          >
            Trade smarter with{" "}
            <span className="relative">
              <span className="text-terminal-cyan animate-flicker">
                AI signals
              </span>
              <span
                className="absolute -bottom-1 left-0 right-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, oklch(0.78 0.18 174), transparent)",
                }}
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-base text-muted-foreground leading-relaxed mb-8"
          >
            AI-powered signals. Real-time market intelligence. Get precision
            BUY, SELL, and HOLD recommendations for the top cryptocurrencies —
            updated every 30 seconds.
          </motion.p>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-6 justify-center lg:justify-start"
          >
            {[
              { label: "Coins", value: "31" },
              { label: "Accuracy", value: "87.4%" },
              { label: "Updates", value: "30s" },
              { label: "Indicators", value: "200+" },
            ].map(({ label, value }) => (
              <div key={label} className="text-center lg:text-left">
                <div className="text-xl font-bold font-mono text-terminal-cyan">
                  {value}
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                  {label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Feature cards — desktop only */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="hidden lg:grid grid-cols-2 gap-3 mt-8"
          >
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.08 }}
                className="rounded-xl p-3"
                style={{
                  background: "oklch(0.14 0.01 235)",
                  border: "1px solid oklch(0.22 0.012 240)",
                }}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="p-1.5 rounded-lg shrink-0"
                    style={{
                      background: "oklch(0.78 0.18 174 / 0.12)",
                      border: "1px solid oklch(0.78 0.18 174 / 0.25)",
                    }}
                  >
                    <Icon className="w-3.5 h-3.5 text-terminal-cyan" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs font-display text-foreground mb-0.5">
                      {title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: Sign-in card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "oklch(0.135 0.007 240)",
              border: "1px solid oklch(0.24 0.012 240)",
              boxShadow:
                "0 8px 40px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(0.28 0.015 240 / 0.3)",
            }}
          >
            {/* Card header */}
            <div
              className="px-8 pt-8 pb-6"
              style={{
                borderBottom: "1px solid oklch(0.20 0.010 240)",
              }}
            >
              {/* Sign in / Sign up tabs */}
              <div
                className="flex rounded-xl overflow-hidden p-1 gap-1 mb-6"
                style={{ background: "oklch(0.10 0.006 240)" }}
              >
                <button
                  type="button"
                  data-ocid="login.signin.tab"
                  onClick={() => switchTab("signin")}
                  className="flex-1 py-2.5 text-sm font-semibold font-display rounded-lg transition-all duration-200"
                  style={
                    activeTab === "signin"
                      ? {
                          background: "oklch(0.20 0.012 240)",
                          color: "oklch(0.93 0.008 220)",
                          boxShadow: "0 2px 8px oklch(0 0 0 / 0.3)",
                        }
                      : {
                          color: "oklch(0.55 0.012 225)",
                        }
                  }
                >
                  Sign In
                </button>
                <button
                  type="button"
                  data-ocid="login.signup.tab"
                  onClick={() => switchTab("signup")}
                  className="flex-1 py-2.5 text-sm font-semibold font-display rounded-lg transition-all duration-200"
                  style={
                    activeTab === "signup"
                      ? {
                          background: "oklch(0.20 0.012 240)",
                          color: "oklch(0.93 0.008 220)",
                          boxShadow: "0 2px 8px oklch(0 0 0 / 0.3)",
                        }
                      : {
                          color: "oklch(0.55 0.012 225)",
                        }
                  }
                >
                  Create Account
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-xl font-bold font-display text-foreground">
                    {authMode === "signin"
                      ? "Welcome back"
                      : authMode === "signup"
                        ? "Verify your email"
                        : "Reset your password"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {authMode === "signin"
                      ? "Sign in to access your AI trading dashboard"
                      : authMode === "signup"
                        ? "Create your account with OTP verification"
                        : "Use OTP to securely reset your password"}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Card body */}
            <div className="px-8 py-6 space-y-4">
              {authMode !== "forgot" && (
                <>
              {/* Social login buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  data-ocid="login.google.button"
                  onClick={login}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "oklch(0.18 0.008 235)",
                    border: "1px solid oklch(0.26 0.012 240)",
                    color: "oklch(0.88 0.008 220)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "oklch(0.22 0.010 240)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "oklch(0.32 0.015 240)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "oklch(0.18 0.008 235)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "oklch(0.26 0.012 240)";
                  }}
                >
                  <SiGoogle className="w-4 h-4 text-[#4285F4]" />
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  data-ocid="login.apple.button"
                  onClick={login}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "oklch(0.18 0.008 235)",
                    border: "1px solid oklch(0.26 0.012 240)",
                    color: "oklch(0.88 0.008 220)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "oklch(0.22 0.010 240)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "oklch(0.32 0.015 240)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "oklch(0.18 0.008 235)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "oklch(0.26 0.012 240)";
                  }}
                >
                  <SiApple className="w-4 h-4 text-foreground" />
                  <span>Apple</span>
                </button>
              </div>
                </>
              )}

              {authMode !== "forgot" && (
                <>
              {/* OR divider */}
              <div className="flex items-center gap-3">
                <div
                  className="flex-1 h-px"
                  style={{ background: "oklch(0.22 0.010 240)" }}
                />
                <span className="text-xs font-mono text-muted-foreground px-1">
                  OR
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: "oklch(0.22 0.010 240)" }}
                />
              </div>
                </>
              )}

              {/* Email field */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "oklch(0.55 0.012 225)" }}
                  />
                  <Input
                    id="email"
                    data-ocid="login.email.input"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-transparent border-border focus:border-terminal-cyan focus:ring-terminal-cyan/20 font-mono text-sm h-11 rounded-xl"
                    style={{
                      background: "oklch(0.10 0.006 240)",
                      borderColor: "oklch(0.24 0.010 240)",
                    }}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono"
                  >
                    {authMode === "forgot" ? "New Password" : "Password"}
                  </Label>
                  {activeTab === "signin" && !forgotMode && (
                    <button
                      type="button"
                      data-ocid="login.forgot_password.button"
                      onClick={() => {
                        setForgotMode(true);
                        resetOtpFlow();
                      }}
                      className="text-xs font-mono transition-colors"
                      style={{ color: "oklch(0.78 0.18 174)" }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "oklch(0.55 0.012 225)" }}
                  />
                  <Input
                    id="password"
                    data-ocid="login.password.input"
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      authMode === "forgot"
                        ? "Enter your new password"
                        : "Enter your password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-transparent border-border focus:border-terminal-cyan focus:ring-terminal-cyan/20 font-mono text-sm h-11 rounded-xl"
                    style={{
                      background: "oklch(0.10 0.006 240)",
                      borderColor: "oklch(0.24 0.010 240)",
                    }}
                  />
                  <button
                    data-ocid="login.password_toggle.button"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "oklch(0.55 0.012 225)" }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {(authMode === "signup" || authMode === "forgot") && otpRequested && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="otp"
                    className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono"
                  >
                    OTP Code
                  </Label>
                  <Input
                    id="otp"
                    data-ocid="login.otp.input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="bg-transparent border-border focus:border-terminal-cyan focus:ring-terminal-cyan/20 font-mono text-sm h-11 rounded-xl"
                    style={{
                      background: "oklch(0.10 0.006 240)",
                      borderColor: "oklch(0.24 0.010 240)",
                    }}
                  />
                </div>
              )}

              {infoMessage && (
                <p className="text-xs font-mono" style={{ color: "oklch(0.72 0.18 155)" }}>
                  {infoMessage}
                </p>
              )}

              {formError && (
                <p className="text-xs font-mono" style={{ color: "oklch(0.72 0.18 25)" }}>
                  {formError}
                </p>
              )}

              {/* Primary CTA */}
              <Button
                data-ocid="login.submit.button"
                onClick={handleEmailAuth}
                disabled={isLoading}
                className="w-full h-12 text-base font-bold font-display rounded-xl transition-all duration-200"
                style={{
                  background: isLoading
                    ? "oklch(0.65 0.12 88)"
                    : "oklch(0.82 0.16 88)",
                  color: "oklch(0.10 0.01 88)",
                  boxShadow: isLoading
                    ? "none"
                    : "0 0 20px oklch(0.82 0.16 88 / 0.35), 0 4px 12px oklch(0 0 0 / 0.3)",
                  border: "none",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Please wait...
                  </>
                ) : authMode === "signin" ? (
                  "Sign In"
                ) : authMode === "signup" ? (
                  otpRequested ? "Verify OTP & Create Account" : "Send OTP"
                ) : (
                  otpRequested ? "Verify OTP & Reset Password" : "Send OTP"
                )}
              </Button>

              {/* Switch tab link */}
              <p className="text-center text-sm text-muted-foreground">
                {forgotMode ? (
                  <>
                    Remembered your password?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setForgotMode(false);
                        resetOtpFlow();
                      }}
                      className="font-semibold font-display transition-colors"
                      style={{ color: "oklch(0.78 0.18 174)" }}
                    >
                      Back to Sign In
                    </button>
                  </>
                ) : activeTab === "signin" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      data-ocid="login.switch_to_signup.button"
                      onClick={() => switchTab("signup")}
                      className="font-semibold font-display transition-colors"
                      style={{ color: "oklch(0.78 0.18 174)" }}
                    >
                      Create Account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      data-ocid="login.switch_to_signin.button"
                      onClick={() => switchTab("signin")}
                      className="font-semibold font-display transition-colors"
                      style={{ color: "oklch(0.78 0.18 174)" }}
                    >
                      Sign In
                    </button>
                  </>
                )}
              </p>
            </div>

            {/* Card footer — security notice */}
            <div
              className="px-8 py-4 flex items-center justify-center gap-2"
              style={{
                borderTop: "1px solid oklch(0.20 0.010 240)",
                background: "oklch(0.105 0.006 240)",
              }}
            >
              <Shield
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: "oklch(0.72 0.18 155)" }}
              />
              <p
                className="text-xs text-center font-mono"
                style={{ color: "oklch(0.50 0.012 225)" }}
              >
                Secured authentication — passwords are hashed, OTP expires in 10 minutes
              </p>
            </div>
          </div>

          {/* Trust badges below card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-6 mt-4"
          >
            {[
              { icon: Shield, label: "256-bit SSL" },
              { icon: Lock, label: "Encrypted" },
              { icon: Activity, label: "99.9% Uptime" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-xs font-mono"
                style={{ color: "oklch(0.45 0.010 225)" }}
              >
                <Icon className="w-3 h-3" />
                <span>{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </main>

      {/* Feature grid — mobile only */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="relative z-10 lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full mx-auto px-6 pb-8"
      >
        {FEATURES.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.08 }}
            className="rounded-xl p-4"
            style={{
              background: "oklch(0.14 0.01 235)",
              border: "1px solid oklch(0.22 0.012 240)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-lg shrink-0"
                style={{
                  background: "oklch(0.78 0.18 174 / 0.12)",
                  border: "1px solid oklch(0.78 0.18 174 / 0.25)",
                }}
              >
                <Icon className="w-4 h-4 text-terminal-cyan" />
              </div>
              <div>
                <h3 className="font-semibold text-sm font-display text-foreground mb-1">
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <footer
        className="relative z-10 text-center py-4 text-xs text-muted-foreground font-mono"
        style={{ borderTop: "1px solid oklch(0.18 0.01 235)" }}
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-terminal-cyan hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}

