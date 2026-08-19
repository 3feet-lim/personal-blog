import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import { IBM_Plex_Sans_KR, Newsreader } from "next/font/google";

import { appName, siteSubtitle } from "../lib/config";
import { SessionProvider } from "../lib/auth";
import { SessionNav } from "../components/session-nav";
import { ModeToggleSlot } from "../components/mode-toggle-slot";
import { SiteFooter } from "../components/site-footer";
import { RssLink } from "../components/rss-link";
import { PostCounter } from "../components/post-counter";

const plexSansKr = IBM_Plex_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-plex-sans-kr",
  display: "swap"
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-newsreader",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Personal Blog",
  description: "Tech blog and private family album."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${plexSansKr.variable} ${newsreader.variable}`}>
      <body>
        <SessionProvider>
          <div className="shell page">
            <header className="topbar">
              <div className="brand-group">
                <div className="brand-row">
                  <div className="sigil" aria-hidden="true">
                    j
                  </div>
                  <div>
                    <Link className="brand" href="/">
                      {appName}
                    </Link>
                    <div className="brand-subtitle">{siteSubtitle}</div>
                  </div>
                </div>
              </div>
              <nav className="nav">
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
