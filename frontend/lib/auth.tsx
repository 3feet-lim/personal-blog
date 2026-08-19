"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { getSession, type SessionUser } from "./api";

const DEMO_EMAIL_STORAGE_KEY = "personal_blog_demo_email";

const ANONYMOUS_USER: SessionUser = {
  email: "anonymous",
  name: "Anonymous",
  role: "anonymous",
  approved: false,
  familyAccess: false
};

export function getStoredDemoEmail(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return window.localStorage.getItem(DEMO_EMAIL_STORAGE_KEY) ?? undefined;
}

export function setStoredDemoEmail(email: string) {
  window.localStorage.setItem(DEMO_EMAIL_STORAGE_KEY, email);
}

export function clearStoredDemoEmail() {
  window.localStorage.removeItem(DEMO_EMAIL_STORAGE_KEY);
}

type SessionState = {
  user: SessionUser;
  demoEmail: string | undefined;
  loading: boolean;
  reload: () => Promise<void>;
};

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser>(ANONYMOUS_USER);
  const [demoEmail, setDemoEmail] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const email = getStoredDemoEmail();
    setDemoEmail(email);
    try {
      const result = await getSession(email);
      setUser(result.user);
    } catch {
      setUser(ANONYMOUS_USER);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Re-check the session whenever the tab regains focus so that a login/logout
  // performed elsewhere (or session expiry) is reflected without a full reload.
  useEffect(() => {
    function handleFocus() {
      reload();
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [reload]);

  return (
    <SessionContext.Provider value={{ user, demoEmail, loading, reload }}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionState {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider.");
  }
  return context;
}

export function canAccessFamily(role: string, familyAccess: boolean) {
  return role === "admin" || familyAccess;
}

export function isAdmin(role: string) {
  return role === "admin";
}
