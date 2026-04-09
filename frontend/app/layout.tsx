import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import { appName } from "../lib/config";
import { loadSessionForDemo } from "../lib/auth";
import { clearDemoSessionAction } from "./login/actions";

export const metadata: Metadata = {
  title: "Personal Blog",
  description: "Tech blog and private family album."
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { user, demoEmail } = await loadSessionForDemo();

  return (
    <html lang="ko">
      <body>
        <div className="shell page">
          <header className="topbar">
            <Link className="brand" href="/">
              {appName}
            </Link>
            <nav className="nav">
              <Link href="/blog">Blog</Link>
              <Link href="/album">Family Album</Link>
              <Link href="/admin">Admin</Link>
              <Link href="/login">Login</Link>
              <span className="nav-session">{demoEmail ?? user.email}</span>
              {demoEmail ? (
                <form action={clearDemoSessionAction}>
                  <button className="nav-button" type="submit">
                    logout
                  </button>
                </form>
              ) : null}
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
