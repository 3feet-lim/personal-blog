import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const nextPath = url.searchParams.get("next") || "/";

  if (!email) {
    return NextResponse.redirect(new URL("/login?oauth=missing-email", request.url), { status: 303 });
  }

  cookies().set("demo_user", email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.redirect(new URL(nextPath, request.url), { status: 303 });
}
