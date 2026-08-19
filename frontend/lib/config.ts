export const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Jaeyoung's Notes";

export const siteSubtitle = process.env.NEXT_PUBLIC_SITE_SUBTITLE ?? "Engineering journal, since 2021";

export const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;

if (!apiUrl && typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.error("NEXT_PUBLIC_API_URL is not set.");
}
