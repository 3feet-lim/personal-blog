"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { getAllBlogPosts, getTagsList, type BlogPost, type Tag } from "../../lib/api";
import { formatRelativeTime } from "../../lib/format-date";

function formatDate(value: string | null) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function TagsView() {
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");

  const [tags, setTags] = useState<Tag[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTagsList()
      .then((data) => setTags(data.items))
      .catch(() => setTags([]));

    getAllBlogPosts()
      .then((data) => setPosts(data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts = useMemo(() => {
    if (!activeTag) {
      return [];
    }
    return posts.filter((post) => post.tags.includes(activeTag));
  }, [posts, activeTag]);

  return (
    <section>
      <div className="eyebrow">Tags</div>
      <h1 className="section-title">태그로 찾아보기</h1>

      {loading ? (
        <p className="empty-state">불러오는 중...</p>
      ) : (
        <>
          <div className="tag-row" style={{ marginBottom: 32 }}>
            {tags.map((item) => (
              <Link
                key={item.tag}
                href={`/tags?tag=${encodeURIComponent(item.tag)}`}
                className={`tag ${activeTag === item.tag ? "active" : ""}`}
              >
                {item.tag} ({item.count})
              </Link>
            ))}
            {tags.length === 0 ? <p className="empty-state">태그가 없습니다.</p> : null}
          </div>

          {activeTag ? (
            <>
              <div className="rule" />
              <div className="month-heading" style={{ marginTop: 24 }}>
                <span>#{activeTag}</span>
                <span className="entry-count">{filteredPosts.length} posts</span>
              </div>
              {filteredPosts.length === 0 ? (
                <p className="empty-state">해당 태그의 게시물이 없습니다.</p>
              ) : (
                <div className="list">
                  {filteredPosts.map((post) => (
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
              )}
            </>
          ) : (
            <p className="empty-state">태그를 선택하면 해당 태그의 글 목록을 볼 수 있습니다.</p>
          )}
        </>
      )}
    </section>
  );
}

export default function TagsPage() {
  return (
    <Suspense fallback={<p className="empty-state">불러오는 중...</p>}>
      <TagsView />
    </Suspense>
  );
}
