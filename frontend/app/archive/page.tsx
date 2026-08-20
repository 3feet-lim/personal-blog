"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { getAllBlogPosts, type BlogPost } from "../../lib/api";
import { formatRelativeTime } from "../../lib/format-date";

function formatDate(value: string | null) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function groupByYearMonth(items: BlogPost[]) {
  const groups = new Map<string, BlogPost[]>();
  for (const item of items) {
    if (!item.published_at) {
      continue;
    }
    const date = new Date(item.published_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(item);
    groups.set(key, bucket);
  }
  return Array.from(groups.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

export default function ArchivePage() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllBlogPosts()
      .then((data) => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => groupByYearMonth(items), [items]);

  return (
    <section>
      <div className="eyebrow">Archive</div>
      <h1 className="section-title">연도/월별 아카이브</h1>

      {loading ? (
        <p className="empty-state">불러오는 중...</p>
      ) : groups.length === 0 ? (
        <p className="empty-state">표시할 게시물이 없습니다.</p>
      ) : (
        groups.map(([key, posts]) => {
          const [year, month] = key.split("-");
          return (
            <div className="month-group" key={key}>
              <div className="month-heading">
                <span>
                  {year}.{month}
                </span>
                <span className="entry-count">{posts.length} posts</span>
              </div>
              <div className="rule" />
              <div className="list">
                {posts.map((post) => (
                  <Link
                    key={post.slug}
                    className="post-list-item"
                    href={`/blog/post?slug=${encodeURIComponent(post.slug)}`}
                  >
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
            </div>
          );
        })
      )}
    </section>
  );
}
