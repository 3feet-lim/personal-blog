"use client";

import { useRouter } from "next/navigation";

import { canAccessFamily, useSession } from "../lib/auth";

export function ModeToggle({ current }: { current: "tech" | "family" }) {
  const { user, loading } = useSession();
  const router = useRouter();

  if (loading || !canAccessFamily(user.role, user.familyAccess)) {
    return null;
  }

  return (
    <div className="mode-toggle">
      <button
        type="button"
        className={current === "tech" ? "active" : undefined}
        onClick={() => router.push("/")}
      >
        Tech
      </button>
      <button
        type="button"
        className={current === "family" ? "active" : undefined}
        onClick={() => router.push("/family")}
      >
        Family
      </button>
    </div>
  );
}
