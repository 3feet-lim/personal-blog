import { backendUrl } from "./config";

export type SessionUser = {
  email: string;
  name: string;
  role: "anonymous" | "member" | "family" | "admin";
  approved: boolean;
  familyAccess: boolean;
};

export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  published_at: string | null;
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

export type AdminUser = {
  id: number;
  email: string;
  display_name: string;
  role: string;
  approved: boolean;
  family_access: boolean;
};

async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(`${backendUrl}${path}`, {
      ...init,
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getSession(email?: string) {
  const headers = email ? { "x-demo-user": email } : undefined;
  return request<{ user: SessionUser }>("/api/me", { headers });
}

export async function getAuthProviders() {
  return request<{ providers: AuthProvider[] }>("/api/auth/providers");
}

export async function getBlogPosts() {
  return request<{ items: BlogPost[] }>("/api/blog/posts");
}

export async function getBlogPost(slug: string) {
  return request<BlogPost>(`/api/blog/posts/${slug}`);
}

export async function getAlbums(email?: string) {
  const headers = email ? { "x-demo-user": email } : undefined;
  return request<{ items: Album[] }>("/api/albums", { headers });
}

export async function getAlbum(slug: string, email?: string) {
  const headers = email ? { "x-demo-user": email } : undefined;
  return request<
    Album & { items: Array<{ id: number; caption: string; asset_id: number | null; asset_url: string | null }> }
  >(
    `/api/albums/${slug}`,
    { headers }
  );
}

export async function getAdminUsers(email?: string) {
  const headers = email ? { "x-demo-user": email } : undefined;
  return request<{ items: AdminUser[] }>("/api/admin/users", { headers });
}
