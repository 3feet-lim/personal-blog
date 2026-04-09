import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const nextPath = String(formData.get("nextPath") ?? "/");

  if (!email) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  cookies().set("demo_user", email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  return NextResponse.redirect(new URL(nextPath, request.url), { status: 303 });
}
