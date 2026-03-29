export const AUTH_SESSION_KEY = "cvai_auth_session";
export const AUTH_CHANGE_EVENT = "cvai-auth-changed";

export type AuthSession = {
  token: string;
  user: {
    id: string;
    email: string;
  };
};

export function getAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setAuthSession(session: AuthSession) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}
