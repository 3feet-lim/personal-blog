import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import { Gothic_A1, Hahmlet, JetBrains_Mono } from "next/font/google";

import { appName } from "../lib/config";
import { SessionProvider } from "../lib/auth";
import { SessionNav } from "../components/session-nav";
import { ModeToggleSlot } from "../components/mode-toggle-slot";
import { SiteFooter } from "../components/site-footer";
import { RssLink } from "../components/rss-link";
import { PostCounter } from "../components/post-counter";
import { SiteBrand } from "../components/site-brand";

const hahmlet = Hahmlet({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-hahmlet",
  display: "swap"
});

const gothicA1 = Gothic_A1({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-gothic-a1",
  display: "swap"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: appName,
  description: "Tech blog and private family album."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${hahmlet.variable} ${gothicA1.variable} ${jetbrainsMono.variable}`}>
      <body>
        <SessionProvider>
          <div className="shell page">
            <header className="topbar">
              <div className="brand-group">
                <div className="brand-row">
                  <div className="sigil" aria-hidden="true">
                    j
                  </div>
                  <SiteBrand />
                </div>
              </div>
              <nav className="nav">
                <Link href="/blog">Blog</Link>
                <Link href="/archive">Archive</Link>
                <Link href="/tags">Tags</Link>
                <Link href="/about">About</Link>
                <RssLink />
                <SessionNav />
              </nav>
            </header>
            <div className="rule" />
            <div className="bar">
              <ModeToggleSlot />
              <PostCounter />
            </div>
            {children}
          </div>
          <SiteFooter />
        </SessionProvider>
      </body>
    </html>
  );
}
