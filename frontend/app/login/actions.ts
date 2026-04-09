"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const DEMO_COOKIE = "demo_user";

export async function setDemoSessionAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const nextPath = String(formData.get("nextPath") ?? "/");

  if (!email) {
    throw new Error("Demo email is required.");
  }

  cookies().set(DEMO_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  redirect(nextPath);
}

export async function clearDemoSessionAction() {
  cookies().delete(DEMO_COOKIE);
  redirect("/login");
}
