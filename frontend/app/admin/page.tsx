import { AdminDashboard } from "../../components/admin-dashboard";
import { getAdminUsers, getAlbums, getBlogPosts } from "../../lib/api";
import { isAdmin, loadSessionForDemo } from "../../lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const { user, demoEmail } = await loadSessionForDemo(searchParams);
  const notice =
    typeof searchParams?.created === "string"
      ? `${searchParams.created} created`
      : typeof searchParams?.updated === "string"
        ? `${searchParams.updated} updated`
        : typeof searchParams?.uploaded === "string"
          ? `${searchParams.uploaded} uploaded`
        : undefined;

  if (!isAdmin(user.role)) {
    return (
      <section className="panel section-card guard">
        <div className="eyebrow">Admin Only</div>
        <h1 className="section-title">관리자 권한이 필요합니다.</h1>
        <p>
          현재 세션: <code>{demoEmail ?? "anonymous"}</code>
        </p>
      </section>
    );
  }

  const [usersData, postsData, albumsData] = await Promise.all([
    getAdminUsers(demoEmail),
    getBlogPosts(),
    getAlbums(demoEmail)
  ]);

  return (
    <AdminDashboard
      demoEmail={demoEmail ?? "admin@example.com"}
      notice={notice}
      user={user}
      users={usersData?.items ?? []}
      posts={postsData?.items ?? []}
      albums={albumsData?.items ?? []}
    />
  );
}
