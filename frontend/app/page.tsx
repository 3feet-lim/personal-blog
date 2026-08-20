"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getBlogPosts, getSeriesList, getTagsList, type BlogPost, type Series, type Tag } from "../lib/api";
import { formatRelativeTime } from "../lib/format-date";

const PAGE_SIZE = 6;

function formatDate(value: string | null) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

export default function HomePage() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [series, setSeries] = useState<Series[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    getBlogPosts(PAGE_SIZE, 0)
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
      })
      .catch(() => {
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));

    getSeriesList()
      .then((data) => setSeries(data.items))
      .catch(() => setSeries([]));

    getTagsList()
      .then((data) => setTags(data.items))
      .catch(() => setTags([]));
  }, []);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const data = await getBlogPosts(PAGE_SIZE, items.length);
      setItems((prev) => [...prev, ...data.items]);
      setTotal(data.total);
    } catch {
      // keep current items on failure
    } finally {
      setLoadingMore(false);
    }
  }

  const [latest, ...rest] = items;
  const hasMore = items.length < total;

  return (
    <div className="layout-grid">
      <section>
        {loading ? (
          <p className="empty-state">불러오는 중...</p>
        ) : items.length === 0 ? (
          <p className="empty-state">표시할 게시물이 없습니다.</p>
        ) : (
          <>
            <article>
              <div className="eyebrow">Latest / {formatDate(latest.published_at)}</div>
              <Link href={`/blog/post?slug=${encodeURIComponent(latest.slug)}`}>
                <h1 className="latest-title">{latest.title}</h1>
              </Link>
              <p className="latest-summary">{latest.summary}</p>
              <div className="tag-row">
                {latest.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
                <span className="read-time">{formatRelativeTime(latest.published_at)}</span>
              </div>
            </article>

            {rest.length > 0 ? (
              <div className="list" style={{ marginTop: 40 }}>
                {rest.map((post) => (
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
            ) : null}

            {hasMore ? (
              <div className="more" style={{ marginTop: 24 }}>
                <button type="button" className="button secondary" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? "불러오는 중..." : "Older posts →"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>

      <aside>
        <div className="sidebar-block">
          <h4>Series</h4>
          <div className="list">
            {series.map((item) => (
              <div key={item.slug} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                <span>{item.title}</span>
                <b>{item.post_count}</b>
              </div>
            ))}
            {series.length === 0 ? <p className="empty-state">시리즈가 없습니다.</p> : null}
          </div>
        </div>

        <div className="sidebar-block">
          <h4>Tags</h4>
          <div className="tag-row">
            {tags.map((item) => (
              <Link key={item.tag} href={`/tags?tag=${encodeURIComponent(item.tag)}`} className="tag">
                {item.tag}
              </Link>
            ))}
            {tags.length === 0 ? <p className="empty-state">태그가 없습니다.</p> : null}
          </div>
        </div>

        <div className="subscribe-box">
          <h3>글이 올라오면 메일로</h3>
          <p>한 달에 한두 통. 광고 없음.</p>
          <form onSubmit={(event) => event.preventDefault()}>
            <input type="email" placeholder="you@mail.com" aria-label="email" />
            <button type="submit" className="button primary">
              구독
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
