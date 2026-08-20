"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getBlogPosts, type BlogPost } from "../../lib/api";
import { formatRelativeTime } from "../../lib/format-date";

function formatDate(value: string | null) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

export default function BlogListPage() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogPosts(100, 0)
      .then((data) => setItems(data.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <div className="eyebrow">Archive</div>
      <h1 className="section-title">Tech Blog</h1>
      {loading ? (
        <p className="empty-state">불러오는 중...</p>
      ) : items.length === 0 ? (
        <p className="empty-state">표시할 게시물이 없습니다.</p>
      ) : (
        <div className="list">
          {items.map((post) => (
            <Link key={post.slug} className="post-list-item" href={`/blog/post?slug=${encodeURIComponent(post.slug)}`}>
              <span className="post-date">{formatDate(post.published_at)}</span>
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
          ))}
        </div>
      )}
    </section>
  );
}
