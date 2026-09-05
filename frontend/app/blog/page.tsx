"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { getAdminBlogPosts, getBlogPosts, type BlogPost } from "../../lib/api";
import { formatRelativeTime } from "../../lib/format-date";
import { canWrite, useSession } from "../../lib/auth";
import { PostActionsMenu } from "../../components/post-actions-menu";

function formatDate(value: string | null) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

export default function BlogListPage() {
  const { user, demoEmail, loading: sessionLoading } = useSession();
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const writer = canWrite(user.role);
  const isAnonymous = user.email === "anonymous";
  const disabledReason = isAnonymous ? "로그인이 필요합니다." : "작성 권한이 없습니다.";

  const load = useCallback(() => {
    setLoading(true);
    // Writers get the management list (their own drafts + editable flags);
    // everyone else gets the public published-only list.
    const fetcher = writer
      ? getAdminBlogPosts(demoEmail).then((data) => data.items)
      : getBlogPosts(100, 0).then((data) => data.items);
    fetcher
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [writer, demoEmail]);

  useEffect(() => {
    if (!sessionLoading) {
      load();
    }
  }, [sessionLoading, load]);

  return (
    <section>
      <div className="blog-list-header">
        <div>
          <div className="eyebrow">Archive</div>
          <h1 className="section-title">Tech Blog</h1>
        </div>
        {sessionLoading ? null : writer ? (
          <Link className="button primary" href="/blog/new">
            새 글 작성
          </Link>
        ) : (
          <button className="button primary" type="button" disabled title={disabledReason}>
            새 글 작성
          </button>
        )}
      </div>

      {loading ? (
        <p className="empty-state">불러오는 중...</p>
      ) : items.length === 0 ? (
        <p className="empty-state">표시할 게시물이 없습니다.</p>
      ) : (
        <div className="list">
          {items.map((post) => (
            <div className="post-row" key={post.slug}>
              <Link className="post-list-item" href={`/blog/post?slug=${encodeURIComponent(post.slug)}`}>
                <span className="post-date">
                  {formatDate(post.published_at)}
                  {post.status === "draft" ? <span className="draft-badge">draft</span> : null}
                </span>
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
                <div className="tag-row">
                  {post.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                  <span className="read-time">{formatRelativeTime(post.published_at)}</span>
                </div>
              </Link>
              {post.editable ? (
                <PostActionsMenu post={post} demoEmail={demoEmail} onChanged={load} />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
