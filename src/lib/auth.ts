import type { AuthResponse, AuthSession } from "@/types";

const AUTH_STORAGE_KEY = "commercehub.auth.session";
const DEVICE_STORAGE_KEY = "commercehub.device.id";

export const AUTH_SESSION_CHANGED_EVENT = "commercehub:auth-session-changed";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function sessionFromAuthResponse(response: AuthResponse): AuthSession {
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    tokenType: response.tokenType || "Bearer",
    user: {
      id: response.userId,
      username: response.username,
      email: response.email,
      fullName: response.fullName,
    },
  };
}

export function readAuthSession(): AuthSession | null {
  if (!isBrowser()) return null;

  try {
    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawSession) return null;

    const session = JSON.parse(rawSession) as AuthSession;
    if (
      !session.accessToken ||
      !session.refreshToken ||
      !session.user?.email
    ) {
      clearAuthSession();
      return null;
    }

    return session;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function saveAuthSession(session: AuthSession): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(
    new CustomEvent<AuthSession | null>(AUTH_SESSION_CHANGED_EVENT, {
      detail: session,
    }),
  );
}

export function clearAuthSession(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(
    new CustomEvent<AuthSession | null>(AUTH_SESSION_CHANGED_EVENT, {
      detail: null,
    }),
  );
}

export function getDeviceId(): string | undefined {
  if (!isBrowser()) return undefined;

  const existingId = window.localStorage.getItem(DEVICE_STORAGE_KEY);
  if (existingId) return existingId;

  const deviceId =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
  return deviceId;
}
