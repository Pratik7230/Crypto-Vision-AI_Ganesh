import { motion } from "motion/react";
import { useState } from "react";

interface Country {
  code: string;
  name: string;
  dial: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { code: "AE", name: "UAE", dial: "+971", flag: "🇦🇪" },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬" },
  { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { code: "JP", name: "Japan", dial: "+81", flag: "🇯🇵" },
  { code: "BR", name: "Brazil", dial: "+55", flag: "🇧🇷" },
  { code: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬" },
  { code: "PH", name: "Philippines", dial: "+63", flag: "🇵🇭" },
  { code: "ID", name: "Indonesia", dial: "+62", flag: "🇮🇩" },
  { code: "Other", name: "Other", dial: "+", flag: "🌐" },
];

const DEMO_AMOUNTS = [5000, 7000, 8000, 10000, 12000, 15000];

export interface UserProfile {
  username: string;
  email: string;
  phone: string;
  country: string;
  dialCode: string;
  demoBalance: number;
  onboardingComplete: boolean;
}

interface OnboardingModalProps {
  onComplete: (profile: UserProfile) => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [showCountrySelect, setShowCountrySelect] = useState(false);

  const validate = () => {
    let valid = true;

    // Username: only letters and numbers, no spaces, no special chars
    const trimmedUsername = username.trim();
    if (!trimmedUsername || trimmedUsername.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      valid = false;
    } else if (!/^[a-zA-Z0-9]+$/.test(trimmedUsername)) {
      setUsernameError(
        "Username can only contain letters and numbers (no spaces or special characters)",
      );
      valid = false;
    } else {
      // Duplicate check against taken usernames in localStorage
      const taken: string[] = (() => {
        try {
          return JSON.parse(
            localStorage.getItem("cvai_taken_usernames") ?? "[]",
          ) as string[];
        } catch {
          return [];
        }
      })();
      if (taken.includes(trimmedUsername.toLowerCase())) {
        setUsernameError("Username already taken. Please choose another.");
        valid = false;
      } else {
        setUsernameError("");
      }
    }

    // Email validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError(
        "Please enter a valid email address (e.g. yourname@gmail.com)",
      );
      valid = false;
    } else {
      setEmailError("");
    }

    // Phone validation
    if (!phone.trim() || !/^\d{6,15}$/.test(phone.replace(/\s/g, ""))) {
      setPhoneError("Enter a valid phone number (digits only)");
      valid = false;
    } else {
      setPhoneError("");
    }

    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const trimmedUsername = username.trim();

    // Register username as taken (case-insensitive)
    const taken: string[] = (() => {
      try {
        return JSON.parse(
          localStorage.getItem("cvai_taken_usernames") ?? "[]",
        ) as string[];
      } catch {
        return [];
      }
    })();
    taken.push(trimmedUsername.toLowerCase());
    localStorage.setItem("cvai_taken_usernames", JSON.stringify(taken));

    const demoBalance =
      DEMO_AMOUNTS[Math.floor(Math.random() * DEMO_AMOUNTS.length)];
    const profile: UserProfile = {
      username: trimmedUsername,
      email: email.trim(),
      phone: phone.trim(),
      country: selectedCountry.name,
      dialCode: selectedCountry.dial,
      demoBalance,
      onboardingComplete: true,
    };
    localStorage.setItem("cvai_user_profile", JSON.stringify(profile));
    onComplete(profile);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "oklch(0.07 0.005 240 / 0.96)" }}
      data-ocid="onboarding.modal"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "oklch(0.135 0.007 240)",
          border: "1px solid oklch(0.25 0.012 240)",
          boxShadow:
            "0 24px 80px oklch(0.05 0.005 240 / 0.9), 0 0 0 1px oklch(0.82 0.16 88 / 0.08)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Top gradient bar */}
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.72 0.18 155), oklch(0.78 0.18 174), oklch(0.82 0.16 88))",
          }}
        />

        <div className="p-8">
          {/* Logo + Welcome */}
          <div className="flex flex-col items-center gap-3 mb-8 text-center">
            <img
              src="/assets/generated/crypto-vision-ai-logo.svg"
              alt="Crypto Vision AI"
              className="w-16 h-16"
              style={{
                filter: "drop-shadow(0 0 16px oklch(0.78 0.18 174 / 0.5))",
              }}
            />
            <div>
              <h1
                className="font-display font-bold text-2xl tracking-tight"
                style={{ color: "oklch(0.92 0.008 220)" }}
              >
                Welcome to{" "}
                <span style={{ color: "oklch(0.82 0.16 88)" }}>
                  Crypto Vision AI
                </span>
              </h1>
              <p
                className="text-sm font-mono mt-1.5"
                style={{ color: "oklch(0.55 0.012 225)" }}
              >
                Set up your trading profile to get started
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="onboarding-username"
                className="block text-xs font-mono font-medium mb-1.5"
                style={{ color: "oklch(0.65 0.012 225)" }}
              >
                Username
              </label>
              <input
                id="onboarding-username"
                type="text"
                autoComplete="username"
                placeholder="e.g. TradingPro99"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError("");
                }}
                data-ocid="onboarding.username_input"
                className="w-full rounded-xl px-4 py-3 text-sm font-mono outline-none transition-all placeholder:opacity-40"
                style={{
                  background: "oklch(0.105 0.006 240)",
                  border: usernameError
                    ? "1px solid oklch(0.65 0.22 25)"
                    : "1px solid oklch(0.22 0.010 240)",
                  color: "oklch(0.92 0.008 220)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border =
                    "1px solid oklch(0.82 0.16 88 / 0.6)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = usernameError
                    ? "1px solid oklch(0.65 0.22 25)"
                    : "1px solid oklch(0.22 0.010 240)";
                }}
              />
              {usernameError && (
                <p
                  data-ocid="onboarding.username_error"
                  className="mt-1 text-xs font-mono"
                  style={{ color: "oklch(0.72 0.18 25)" }}
                >
                  {usernameError}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="onboarding-email"
                className="block text-xs font-mono font-medium mb-1.5"
                style={{ color: "oklch(0.65 0.012 225)" }}
              >
                Email Address
              </label>
              <input
                id="onboarding-email"
                type="email"
                autoComplete="email"
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                data-ocid="onboarding.email_input"
                className="w-full rounded-xl px-4 py-3 text-sm font-mono outline-none transition-all placeholder:opacity-40"
                style={{
                  background: "oklch(0.105 0.006 240)",
                  border: emailError
                    ? "1px solid oklch(0.65 0.22 25)"
                    : "1px solid oklch(0.22 0.010 240)",
                  color: "oklch(0.92 0.008 220)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border =
                    "1px solid oklch(0.82 0.16 88 / 0.6)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = emailError
                    ? "1px solid oklch(0.65 0.22 25)"
                    : "1px solid oklch(0.22 0.010 240)";
                }}
              />
              {emailError && (
                <p
                  data-ocid="onboarding.email_error"
                  className="mt-1 text-xs font-mono"
                  style={{ color: "oklch(0.72 0.18 25)" }}
                >
                  {emailError}
                </p>
              )}
            </div>

            {/* Phone + Country code */}
            <div>
              <label
                htmlFor="onboarding-phone"
                className="block text-xs font-mono font-medium mb-1.5"
                style={{ color: "oklch(0.65 0.012 225)" }}
              >
                Phone Number
              </label>
              <div className="flex gap-2">
                {/* Country selector */}
                <div className="relative">
                  <button
                    type="button"
                    data-ocid="onboarding.country_select"
                    onClick={() => setShowCountrySelect((v) => !v)}
                    className="h-full px-3 py-3 rounded-xl text-sm font-mono flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    style={{
                      background: "oklch(0.105 0.006 240)",
                      border: "1px solid oklch(0.22 0.010 240)",
                      color: "oklch(0.80 0.008 220)",
                      minWidth: "90px",
                    }}
                  >
                    <span>{selectedCountry.flag}</span>
                    <span>{selectedCountry.dial}</span>
                    <span style={{ color: "oklch(0.50 0.010 225)" }}>▾</span>
                  </button>

                  {showCountrySelect && (
                    <div
                      className="absolute top-full left-0 mt-1 w-56 rounded-xl overflow-hidden z-10 shadow-2xl"
                      style={{
                        background: "oklch(0.145 0.007 240)",
                        border: "1px solid oklch(0.25 0.012 240)",
                        maxHeight: "220px",
                        overflowY: "auto",
                      }}
                    >
                      {COUNTRIES.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(c);
                            setShowCountrySelect(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono text-left transition-colors hover:bg-white/5"
                          style={{
                            color:
                              selectedCountry.code === c.code
                                ? "oklch(0.82 0.16 88)"
                                : "oklch(0.80 0.008 220)",
                          }}
                        >
                          <span className="text-base">{c.flag}</span>
                          <span className="flex-1">{c.name}</span>
                          <span style={{ color: "oklch(0.55 0.012 225)" }}>
                            {c.dial}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phone input */}
                <input
                  id="onboarding-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/[^0-9\s]/g, ""));
                    setPhoneError("");
                  }}
                  data-ocid="onboarding.phone_input"
                  className="flex-1 rounded-xl px-4 py-3 text-sm font-mono outline-none transition-all placeholder:opacity-40"
                  style={{
                    background: "oklch(0.105 0.006 240)",
                    border: phoneError
                      ? "1px solid oklch(0.65 0.22 25)"
                      : "1px solid oklch(0.22 0.010 240)",
                    color: "oklch(0.92 0.008 220)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border =
                      "1px solid oklch(0.82 0.16 88 / 0.6)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = phoneError
                      ? "1px solid oklch(0.65 0.22 25)"
                      : "1px solid oklch(0.22 0.010 240)";
                  }}
                />
              </div>
              {phoneError && (
                <p
                  data-ocid="onboarding.phone_error"
                  className="mt-1 text-xs font-mono"
                  style={{ color: "oklch(0.72 0.18 25)" }}
                >
                  {phoneError}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              data-ocid="onboarding.submit_button"
              className="w-full py-3.5 rounded-xl text-sm font-mono font-bold mt-2 transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.78 0.18 174), oklch(0.72 0.18 155))",
                color: "oklch(0.07 0.005 155)",
                boxShadow: "0 4px 20px oklch(0.72 0.18 155 / 0.3)",
              }}
            >
              🚀 Create My Trading Profile
            </button>

            <p
              className="text-center text-[11px] font-mono"
              style={{ color: "oklch(0.45 0.010 225)" }}
            >
              You will receive a free demo balance to start trading
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

