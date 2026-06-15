// Client-side authentication for mobile (Capacitor) / browser environments.
// On desktop Electron, authentication is handled server-side via API routes.
// This module provides fallback password validation when no backend is available.

const PASSWORDS_KEY = "mapofus:passwords";
const SESSION_KEY = "mapofus:site-session";

const DEFAULT_SITE_PASSWORD = "1234";
const DEFAULT_ADMIN_PASSWORD = "1234";

interface StoredPasswords {
  site: string;
  admin: string;
}

function readStoredPasswords(): StoredPasswords {
  if (typeof window === "undefined") {
    return { site: DEFAULT_SITE_PASSWORD, admin: DEFAULT_ADMIN_PASSWORD };
  }
  try {
    const raw = localStorage.getItem(PASSWORDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.site && parsed?.admin) {
        return { site: parsed.site, admin: parsed.admin };
      }
    }
  } catch {
    // ignore
  }
  return { site: DEFAULT_SITE_PASSWORD, admin: DEFAULT_ADMIN_PASSWORD };
}

function writeStoredPasswords(passwords: StoredPasswords): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
}

export interface AuthResult {
  ok: boolean;
}

/** Validate site entry password client-side. */
export function validateSitePassword(password: string): AuthResult {
  const { site } = readStoredPasswords();
  const ok = site === password.trim();
  if (ok && typeof window !== "undefined") {
    window.sessionStorage.setItem(SESSION_KEY, "true");
  }
  return { ok };
}

/** Validate admin password client-side. */
export function validateAdminPassword(password: string): AuthResult {
  const { admin } = readStoredPasswords();
  return { ok: admin === password.trim() };
}

/** Change a password (requires admin session to already be active). */
export function setPassword(target: "site" | "admin", newPassword: string): void {
  const passwords = readStoredPasswords();
  if (target === "site") {
    passwords.site = newPassword.trim();
  } else {
    passwords.admin = newPassword.trim();
  }
  writeStoredPasswords(passwords);
}

/** Delete the site session cookie — equivalent to calling DELETE /api/auth/login. */
export function clearSiteSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
}

/** Check if the current browser session has an active site login. */
export function hasSiteSession(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(SESSION_KEY) === "true";
}
