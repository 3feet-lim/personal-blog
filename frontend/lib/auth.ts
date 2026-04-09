import { cookies } from "next/headers";

import { getSession } from "./api";

export async function loadSessionForDemo(searchParams?: Record<string, string | string[] | undefined>) {
  const candidate = searchParams?.as;
  const queryEmail = typeof candidate === "string" ? candidate : undefined;
  const cookieEmail = cookies().get("demo_user")?.value;
  const email = cookieEmail ?? queryEmail;
  const result = await getSession(email);

  return {
    user: result?.user ?? {
      email: "anonymous",
      name: "Anonymous",
      role: "anonymous" as const,
      approved: false,
      familyAccess: false
    },
    demoEmail: email,
    demoSource: cookieEmail ? "cookie" : queryEmail ? "query" : "none"
  };
}

export function canAccessFamily(role: string, familyAccess: boolean) {
  return role === "admin" || familyAccess;
}

export function isAdmin(role: string) {
  return role === "admin";
}
