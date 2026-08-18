import type { AuthResponse, AuthSession } from "@/types";

const DEVICE_STORAGE_KEY = "commercehub.device.id";
const LEGACY_AUTH_STORAGE_KEY = "commercehub.auth.session";
let inMemorySession: AuthSession | null = null;

export const AUTH_SESSION_CHANGED_EVENT = "commercehub:auth-session-changed";

export function clearLegacyAuthStorage(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function sessionFromAuthResponse(response: AuthResponse): AuthSession {
  return {
    accessToken: response.accessToken,
    tokenType: response.tokenType || "Bearer",
    user: {
      id: response.userId,
      username: response.username,
      email: response.email,
      fullName: response.fullName,
      avatarUrl: response.avatarUrl ?? null,
      roles: response.roles ?? [],
      shopId: response.shopId ?? null,
      shopStatus: response.shopStatus ?? null,
    },
  };
}

export function readAuthSession(): AuthSession | null {
  return inMemorySession;
}

export function saveAuthSession(session: AuthSession): void {
  inMemorySession = session;
  if (!isBrowser()) return;
  window.dispatchEvent(
    new CustomEvent<AuthSession | null>(AUTH_SESSION_CHANGED_EVENT, {
      detail: session,
    }),
  );
}

export function clearAuthSession(): void {
  inMemorySession = null;
  if (!isBrowser()) return;
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
