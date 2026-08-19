"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { MarkdownContent } from "../../../components/markdown-content";
import { getBlogPost, type BlogPost } from "../../../lib/api";

function BlogDetail() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? "";
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    setLoading(true);
    setNotFound(false);
    getBlogPost(slug)
      .then((data) => setPost(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <p className="empty-state">불러오는 중...</p>;
  }

  if (notFound || !post) {
    return (
      <section className="panel detail-card">
        <div className="eyebrow">Not Found</div>
        <h1>게시물을 찾을 수 없습니다.</h1>
      </section>
    );
  }

  return (
    <article className="panel detail-card">
      <div className="eyebrow">
        {post.series ? `${post.series.title} · ` : ""}Markdown Rendered
      </div>
      <h1>{post.title}</h1>
      <p>{post.summary}</p>
      <div className="tag-row">
        {post.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
        <span className="read-time">{post.read_time} min read</span>
      </div>
      <MarkdownContent source={post.content} />
    </article>
  );
}

export default function BlogDetailPage() {
  return (
    <Suspense fallback={<p className="empty-state">불러오는 중...</p>}>
      <BlogDetail />
    </Suspense>
  );
}
