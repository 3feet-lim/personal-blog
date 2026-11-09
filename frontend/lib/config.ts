export const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "BigJade's Notes";

export const siteSubtitle = process.env.NEXT_PUBLIC_SITE_SUBTITLE ?? "Engineering journal, since 2026";

export const footerText = process.env.NEXT_PUBLIC_FOOTER_TEXT ?? "© 2026 BigJade";

export const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com";

export const mastodonUrl = process.env.NEXT_PUBLIC_MASTODON_URL ?? "https://mastodon.social";

export const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;

if (!apiUrl && typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.error("NEXT_PUBLIC_API_URL is not set.");
}
