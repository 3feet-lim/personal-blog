import { createBlogPostAction } from "../app/admin/actions";
import type { BlogPost } from "../lib/api";

export function AdminBlogManager({
  demoEmail,
  posts,
  notice
}: {
  demoEmail: string;
  posts: BlogPost[];
  notice?: string;
}) {
  return (
    <section className="stack">
      <div className="panel section-card">
        <div className="eyebrow">Blog Admin</div>
        <h1 className="section-title">블로그 관리</h1>
        {notice ? <p className="inline-notice">최근 작업: {notice}</p> : null}
      </div>

      <form className="panel section-card stack" action={createBlogPostAction}>
        <input type="hidden" name="demoEmail" value={demoEmail} />
        <input type="hidden" name="returnTo" value="/admin/blog" />
        <div className="eyebrow">Write Blog Post</div>
        <h2 className="section-title">새 블로그 글</h2>
        <input name="title" placeholder="제목" required />
        <input name="slug" placeholder="slug (optional)" />
        <textarea name="summary" placeholder="요약" rows={3} required />
        <textarea
          name="content"
          placeholder="# Markdown&#10;&#10;본문을 입력하세요."
          rows={10}
          required
        />
        <select name="status" defaultValue="published">
          <option value="draft">draft</option>
          <option value="published">published</option>
        </select>
        <button className="button primary" type="submit">
          글 생성
        </button>
      </form>

      <div className="panel section-card">
        <div className="eyebrow">Published Posts</div>
        <h2 className="section-title">현재 블로그 글</h2>
        <div className="list">
          {posts.map((post) => (
            <div className="card-link" key={post.slug}>
              <span className="badge">{post.published_at ? "published" : "draft"}</span>
              <h3>{post.title}</h3>
              <p>{post.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
