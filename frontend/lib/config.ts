export const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "personal-blog";
export const browserBackendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
export const backendUrl =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://backend:8000";
