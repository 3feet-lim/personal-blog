"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { clearStoredDemoEmail, useSession } from "../lib/auth";
import { logout } from "../lib/api";

export function SessionNav() {
  const { user, loading, reload } = useSession();
  const router = useRouter();
  const isLoggedIn = user.email !== "anonymous";

  async function handleLogout() {
    clearStoredDemoEmail();
    try {
      await logout();
    } catch {
      // ignore network errors on logout
    }
    await reload();
    router.push("/login");
  }

  if (loading) {
    return <span className="nav-session">...</span>;
  }

  if (!isLoggedIn) {
    return <Link href="/login">Login</Link>;
  }

  return (
    <>
      <span className="nav-session">{user.email}</span>
      <button className="nav-button" type="button" onClick={handleLogout}>
        logout
      </button>
    </>
  );
}
