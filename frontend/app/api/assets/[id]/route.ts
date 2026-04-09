import { cookies } from "next/headers";

import { backendUrl } from "../../../../lib/config";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const url = new URL(request.url);
  const as = url.searchParams.get("as") ?? cookies().get("demo_user")?.value;

  const response = await fetch(`${backendUrl}/api/assets/${params.id}/content`, {
    cache: "no-store",
    headers: as ? { "x-demo-user": as } : undefined
  });

  if (!response.ok) {
    return new Response("Not found", { status: response.status });
  }

  const contentType = response.headers.get("content-type") ?? "application/octet-stream";
  const body = await response.arrayBuffer();

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": contentType,
      "cache-control": "private, max-age=60"
    }
  });
}
