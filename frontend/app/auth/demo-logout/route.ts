import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  cookies().delete("demo_user");
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
