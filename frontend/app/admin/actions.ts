"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { backendUrl } from "../../lib/config";

function getDemoEmail(formData: FormData) {
  const value = formData.get("demoEmail");
  if (typeof value === "string" && value) {
    return value;
  }
  return cookies().get("demo_user")?.value ?? "";
}

async function send(path: string, init: RequestInit) {
  const response = await fetch(`${backendUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Backend request failed.");
  }

  return response;
}

export async function createBlogPostAction(formData: FormData) {
  const demoEmail = getDemoEmail(formData);
  const payload = {
    title: String(formData.get("title") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    content: String(formData.get("content") ?? ""),
    slug: String(formData.get("slug") ?? "") || undefined,
    status: String(formData.get("status") ?? "published")
  };

  await send("/api/admin/blog/posts", {
    method: "POST",
    headers: { "x-demo-user": demoEmail },
    body: JSON.stringify(payload)
  });

  revalidatePath("/blog");
  redirect("/admin?created=post");
}

export async function createAlbumAction(formData: FormData) {
  const demoEmail = getDemoEmail(formData);
  const payload = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    slug: String(formData.get("slug") ?? "") || undefined
  };

  await send("/api/admin/albums", {
    method: "POST",
    headers: { "x-demo-user": demoEmail },
    body: JSON.stringify(payload)
  });

  revalidatePath("/album");
  redirect("/admin?created=album");
}

export async function updateUserAccessAction(formData: FormData) {
  const demoEmail = getDemoEmail(formData);
  const userId = String(formData.get("userId") ?? "");
  const payload = {
    role: String(formData.get("role") ?? "member"),
    approved: formData.get("approved") === "on",
    family_access: formData.get("family_access") === "on"
  };

  await send(`/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: { "x-demo-user": demoEmail },
    body: JSON.stringify(payload)
  });

  revalidatePath("/admin");
  redirect("/admin?updated=user");
}

export async function uploadAlbumImageAction(formData: FormData) {
  const demoEmail = getDemoEmail(formData);
  const albumId = String(formData.get("albumId") ?? "");
  const caption = String(formData.get("caption") ?? "");
  const file = formData.get("file");

  if (!file || typeof file === "string" || !("size" in file) || file.size === 0) {
    throw new Error("Image file is required.");
  }

  const payload = new FormData();
  payload.append("caption", caption);
  payload.append("file", file);

  const response = await fetch(`${backendUrl}/api/admin/albums/${albumId}/items/upload`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "x-demo-user": demoEmail
    },
    body: payload
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Upload failed.");
  }

  revalidatePath("/admin");
  revalidatePath("/album");
  redirect("/admin?uploaded=image");
}
