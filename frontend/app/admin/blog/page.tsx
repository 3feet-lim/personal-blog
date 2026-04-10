import { AdminBlogManager } from "../../../components/admin-blog-manager";
import { getBlogPosts } from "../../../lib/api";
import { isAdmin, loadSessionForDemo } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const { user, demoEmail } = await loadSessionForDemo(searchParams);

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

  const notice =
    typeof searchParams?.created === "string"
      ? `${searchParams.created} created`
      : undefined;
  const postsData = await getBlogPosts();

  return (
    <AdminBlogManager
      demoEmail={demoEmail ?? "admin@example.com"}
      posts={postsData?.items ?? []}
      notice={notice}
    />
  );
}
