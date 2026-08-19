import { apiUrl } from "./config";

export type SessionUser = {
  email: string;
  name: string;
  role: "anonymous" | "member" | "family" | "admin";
  approved: boolean;
  familyAccess: boolean;
};

export type BlogPostSeries = {
  slug: string;
  title: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  published_at: string | null;
  tags: string[];
  read_time: number;
  series: BlogPostSeries | null;
};

export type BlogPostList = {
  items: BlogPost[];
  total: number;
  limit: number;
  offset: number;
};

export type Series = {
  slug: string;
  title: string;
  description: string;
  post_count: number;
};

export type Tag = {
  tag: string;
  count: number;
};

export type AuthProvider = {
  name: string;
  status: string;
  configured: boolean;
  login_url: string;
  redirect_uri: string;
};

export type Album = {
  id: number;
  slug: string;
  title: string;
  description: string;
  item_count: number;
};

export type AlbumDetail = Album & {
  items: Array<{ id: number; title: string; caption: string; asset_id: number | null; asset_url: string | null }>;
};

export type FamilyFeedItem = {
  id: number;
  album_slug: string;
  album_title: string;
  title: string;
  caption: string;
  asset_id: number | null;
  asset_url: string | null;
  created_at: string;
};

export type FamilyFeed = {
  approved_family_count: number;
  years: number[];
  items: FamilyFeedItem[];
};

export type AdminUser = {
  id: number;
  email: string;
  display_name: string;
  role: string;
  approved: boolean;
  family_access: boolean;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = RequestInit & { demoEmail?: string };

async function request<T>(path: string, options?: RequestOptions): Promise<T> {
  const { demoEmail, headers, ...init } = options ?? {};

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...(demoEmail ? { "x-demo-user": demoEmail } : {}),
      ...(headers ?? {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new ApiError(response.status, message || response.statusText);
  }

  return (await response.json()) as T;
}

async function requestJson<T>(
  path: string,
  method: string,
  body: unknown,
  demoEmail?: string
): Promise<T> {
  return request<T>(path, {
    method,
    demoEmail,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

export async function getSession(demoEmail?: string) {
  return request<{ user: SessionUser }>("/api/me", { demoEmail });
}

export async function getAuthProviders() {
  return request<{ providers: AuthProvider[] }>("/api/auth/providers");
}

export async function logout() {
  return request<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}

export async function devLogin(email: string) {
  return requestJson<{ ok: boolean; email: string }>("/api/auth/dev-login", "POST", { email });
}

export async function getBlogPosts(limit = 20, offset = 0) {
  return request<BlogPostList>(`/api/blog/posts?limit=${limit}&offset=${offset}`);
}

export async function getBlogPost(slug: string) {
  return request<BlogPost>(`/api/blog/posts/${encodeURIComponent(slug)}`);
}

export async function getSeriesList() {
  return request<{ items: Series[] }>("/api/blog/series");
}

export async function getTagsList() {
  return request<{ items: Tag[] }>("/api/blog/tags");
}

export function getRssUrl() {
  return `${apiUrl}/api/blog/rss.xml`;
}

export async function getAlbums(demoEmail?: string) {
  return request<{ items: Album[] }>("/api/albums", { demoEmail });
}

export async function getAlbum(slug: string, demoEmail?: string) {
  return request<AlbumDetail>(`/api/albums/${encodeURIComponent(slug)}`, { demoEmail });
}

export async function getFamilyFeed(demoEmail?: string) {
  return request<FamilyFeed>("/api/albums/feed/family", { demoEmail });
}

export async function getAdminUsers(demoEmail?: string) {
  return request<{ items: AdminUser[] }>("/api/admin/users", { demoEmail });
}

export async function createBlogPost(
  payload: {
    title: string;
    summary: string;
    content: string;
    slug?: string;
    status: string;
    tags?: string[];
    series_slug?: string;
  },
  demoEmail?: string
) {
  return requestJson<{ id: number; slug: string; status: string }>(
    "/api/admin/blog/posts",
    "POST",
    payload,
    demoEmail
  );
}

export async function createAdminSeries(
  payload: { title: string; description?: string; slug?: string; sort_order?: number },
  demoEmail?: string
) {
  return requestJson<{ id: number; slug: string; title: string }>("/api/admin/series", "POST", payload, demoEmail);
}

export async function createAlbum(
  payload: { title: string; description?: string; slug?: string },
  demoEmail?: string
) {
  return requestJson<{ id: number; slug: string }>("/api/admin/albums", "POST", payload, demoEmail);
}

export async function createAdminUser(
  payload: { email: string; display_name?: string; role: string; family_access: boolean },
  demoEmail?: string
) {
  return requestJson<AdminUser>("/api/admin/users", "POST", payload, demoEmail);
}

export async function updateUserAccess(
  userId: number,
  payload: { role?: string; approved?: boolean; family_access?: boolean },
  demoEmail?: string
) {
  return requestJson<AdminUser>(`/api/admin/users/${userId}`, "PATCH", payload, demoEmail);
}

export async function uploadAlbumImage(
  albumId: number,
  file: File,
  caption: string,
  demoEmail?: string,
  title?: string
) {
  const formData = new FormData();
  formData.append("caption", caption);
  if (title) {
    formData.append("title", title);
  }
  formData.append("file", file);

  const response = await fetch(`${apiUrl}/api/admin/albums/${albumId}/items/upload`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: demoEmail ? { "x-demo-user": demoEmail } : undefined,
    body: formData
  });

  if (!response.ok) {
    const message = await response.text();
    throw new ApiError(response.status, message || response.statusText);
  }

  return (await response.json()) as { album_id: number; item_id: number; asset_id: number; object_key: string };
}

export function getAssetUrl(assetId: number) {
  return `${apiUrl}/api/assets/${assetId}/content`;
}
