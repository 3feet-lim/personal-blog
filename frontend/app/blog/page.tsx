import Link from "next/link";
import { getBlogPosts } from "../../lib/api";

export const dynamic = "force-dynamic";

export default async function BlogListPage() {
  const data = await getBlogPosts();
  const items = data?.items ?? [];

  return (
    <section className="panel section-card">
      <div className="eyebrow">Public Blog</div>
      <h1 className="section-title">Tech Blog</h1>
      <p>백엔드 API에서 가져온 공개 게시물 목록입니다.</p>
      <div className="list">
        {items.map((post) => (
          <Link key={post.slug} className="card-link" href={`/blog/${post.slug}`}>
            <span className="badge">Published</span>
            <h3>{post.title}</h3>
            <p>{post.summary}</p>
          </Link>
        ))}
      </div>
      {items.length === 0 ? <p className="empty-state">표시할 게시물이 없습니다.</p> : null}
    </section>
  );
}
