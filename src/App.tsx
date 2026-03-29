import { useEffect, useRef, useState } from "react";
import { AppShell } from "./components/AppShell";
import { CongratsSplash } from "./components/CongratsSplash";
import { NotificationPermissionPrompt } from "./components/NotificationPermissionPrompt";
import { OnboardingModal } from "./components/OnboardingModal";
import type { UserProfile } from "./components/OnboardingModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { Login } from "./pages/Login";
import { useAppStore } from "./store/appStore";
import {
  AUTH_CHANGE_EVENT,
  getAuthSession,
} from "./utils/authSession";

// Map timezone strings to country names
const TIMEZONE_COUNTRY_MAP: Record<string, string> = {
  "Asia/Kolkata": "India",
  "Asia/Calcutta": "India",
  "America/New_York": "United States",
  "America/Chicago": "United States",
  "America/Denver": "United States",
  "America/Los_Angeles": "United States",
  "America/Phoenix": "United States",
  "Europe/London": "United Kingdom",
  "Asia/Dubai": "UAE",
  "Australia/Sydney": "Australia",
  "Australia/Melbourne": "Australia",
  "Australia/Brisbane": "Australia",
  "America/Toronto": "Canada",
  "America/Vancouver": "Canada",
  "Asia/Singapore": "Singapore",
  "Europe/Berlin": "Germany",
  "Europe/Paris": "France",
  "Asia/Tokyo": "Japan",
  "America/Sao_Paulo": "Brazil",
  "Africa/Johannesburg": "South Africa",
  "Africa/Lagos": "Nigeria",
  "Asia/Manila": "Philippines",
  "Asia/Jakarta": "Indonesia",
  "Asia/Bangkok": "Thailand",
  "Asia/Seoul": "South Korea",
  "Asia/Shanghai": "China",
  "Asia/Taipei": "Taiwan",
  "Asia/Hong_Kong": "Hong Kong",
  "Europe/Moscow": "Russia",
  "America/Mexico_City": "Mexico",
  "America/Buenos_Aires": "Argentina",
  "Asia/Karachi": "Pakistan",
  "Asia/Dhaka": "Bangladesh",
  "Africa/Cairo": "Egypt",
  "Asia/Riyadh": "Saudi Arabia",
  "Asia/Tehran": "Iran",
  "Europe/Istanbul": "Turkey",
  "Asia/Kuala_Lumpur": "Malaysia",
  "Pacific/Auckland": "New Zealand",
};

function detectCountry(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_COUNTRY_MAP[tz]) {
      return TIMEZONE_COUNTRY_MAP[tz];
    }
    // Try prefix match
    if (tz) {
      for (const [key, country] of Object.entries(TIMEZONE_COUNTRY_MAP)) {
        if (key.startsWith(tz.split("/")[0])) return country;
      }
      return tz; // fallback to timezone string
    }
  } catch {
    // ignore
  }
  return "Unknown";
}

type AppFlow =
  | "loading"
  | "login"
  | "onboarding"
  | "congrats"
  | "notif-prompt"
  | "app";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const addUserLoginRecord = useAppStore((s) => s.addUserLoginRecord);

  const prevIdentityRef = useRef<typeof identity>(null);
  const [flow, setFlow] = useState<AppFlow>("loading");
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(
    null,
  );
  const [hasLocalAuthSession, setHasLocalAuthSession] = useState(false);

  useEffect(() => {
    const syncSession = () => {
      setHasLocalAuthSession(!!getAuthSession());
    };

    syncSession();
    window.addEventListener(AUTH_CHANGE_EVENT, syncSession);
    window.addEventListener("storage", syncSession);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  // Determine initial flow state once identity is known
  useEffect(() => {
    if (isInitializing) return;

    if (!identity && !hasLocalAuthSession) {
      setFlow("login");
      return;
    }

    // Check onboarding status
    const stored = localStorage.getItem("cvai_user_profile");
    if (stored) {
      try {
        const profile = JSON.parse(stored) as UserProfile;
        if (profile.onboardingComplete) {
          setFlow("app");
          return;
        }
      } catch {
        // corrupt data, reset
      }
    }
    setFlow("onboarding");
  }, [isInitializing, identity, hasLocalAuthSession]);

  // Track login record when identity first appears
  useEffect(() => {
    const prev = prevIdentityRef.current;
    prevIdentityRef.current = identity;

    if (!prev && identity) {
      const principal = identity.getPrincipal().toString();
      const email = `user_${principal.slice(0, 6)}@cryptovision.app`;
      const country = detectCountry();

      // Get username from stored profile if available
      let username: string | undefined;
      try {
        const stored = localStorage.getItem("cvai_user_profile");
        if (stored) {
          const p = JSON.parse(stored) as UserProfile;
          username = p.username;
        }
      } catch {
        // ignore
      }

      addUserLoginRecord({
        id: `${principal}_${Date.now()}`,
        email,
        principal,
        loginTime: Date.now(),
        lastSeen: Date.now(),
        userAgent: navigator.userAgent.slice(0, 60),
        country,
        username,
      });
    }
  }, [identity, addUserLoginRecord]);

  // Show loading screen while auth is initializing
  if (isInitializing || flow === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.10 0.005 240)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/generated/crypto-vision-ai-logo.svg"
            alt="Crypto Vision AI"
            className="w-12 h-12 animate-pulse"
          />
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "oklch(0.82 0.16 88)",
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
          <p className="text-xs font-mono text-muted-foreground">
            Initializing secure connection...
          </p>
        </div>
      </div>
    );
  }

  if (flow === "login" || (!identity && !hasLocalAuthSession)) {
    return <Login />;
  }

  if (flow === "onboarding") {
    return (
      <OnboardingModal
        onComplete={(profile) => {
          setPendingProfile(profile);
          // Update login record with profile info now that onboarding is done
          if (identity) {
            const principal = identity.getPrincipal().toString();
            const country =
              profile.country !== "Other" ? profile.country : detectCountry();
            addUserLoginRecord({
              id: `${principal}_${Date.now()}`,
              email: `user_${principal.slice(0, 6)}@cryptovision.app`,
              principal,
              loginTime: Date.now(),
              lastSeen: Date.now(),
              userAgent: navigator.userAgent.slice(0, 60),
              country,
              username: profile.username,
              phone: profile.phone,
              dialCode: profile.dialCode,
              demoBalance: profile.demoBalance,
            });
          }
          setFlow("congrats");
        }}
      />
    );
  }

  if (flow === "congrats") {
    const balance =
      pendingProfile?.demoBalance ??
      (() => {
        try {
          const s = localStorage.getItem("cvai_user_profile");
          if (s) return (JSON.parse(s) as UserProfile).demoBalance;
        } catch {
          // ignore
        }
        return 10000;
      })();

    const username =
      pendingProfile?.username ??
      (() => {
        try {
          const s = localStorage.getItem("cvai_user_profile");
          if (s) return (JSON.parse(s) as UserProfile).username;
        } catch {
          // ignore
        }
        return undefined;
      })();

    return (
      <CongratsSplash
        amount={balance}
        username={username}
        onDismiss={() => setFlow("notif-prompt")}
      />
    );
  }

  if (flow === "notif-prompt") {
    return <NotificationPermissionPrompt onClose={() => setFlow("app")} />;
  }

  return <AppShell />;
}

