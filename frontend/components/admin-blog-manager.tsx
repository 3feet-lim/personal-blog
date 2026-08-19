"use client";

import { type FormEvent, useEffect, useState } from "react";

import { createAdminSeries, createBlogPost, getSeriesList, type BlogPost, type Series } from "../lib/api";

export function AdminBlogManager({
  demoEmail,
  posts,
  onCreated
}: {
  demoEmail: string;
  posts: BlogPost[];
  onCreated?: () => void;
}) {
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [creatingSeries, setCreatingSeries] = useState(false);
  const [series, setSeries] = useState<Series[]>([]);

  function loadSeries() {
    getSeriesList()
      .then((data) => setSeries(data.items))
      .catch(() => setSeries([]));
  }

  useEffect(() => {
    loadSeries();
  }, []);

  async function handleCreateSeries(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setCreatingSeries(true);
    setError(null);

    try {
      await createAdminSeries(
        {
          title: String(formData.get("title") ?? ""),
          description: String(formData.get("description") ?? "")
        },
        demoEmail
      );
      setNotice("series created");
      event.currentTarget.reset();
      loadSeries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "시리즈 생성에 실패했습니다.");
    } finally {
      setCreatingSeries(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);

    const rawTags = String(formData.get("tags") ?? "");
    const tags = rawTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    try {
      await createBlogPost(
        {
          title: String(formData.get("title") ?? ""),
          summary: String(formData.get("summary") ?? ""),
          content: String(formData.get("content") ?? ""),
          slug: String(formData.get("slug") ?? "") || undefined,
          status: String(formData.get("status") ?? "published"),
          tags,
          series_slug: String(formData.get("series_slug") ?? "") || undefined
        },
        demoEmail
      );
      setNotice("post created");
      event.currentTarget.reset();
      onCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "글 생성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="stack">
      <div>
        <div className="eyebrow">Blog Admin</div>
        <h1 className="section-title">블로그 관리</h1>
        {notice ? <p className="inline-notice">최근 작업: {notice}</p> : null}
        {error ? <p className="inline-notice">{error}</p> : null}
      </div>

      <form className="form-block stack" onSubmit={handleCreateSeries}>
        <div className="eyebrow">Create Series</div>
        <h2 className="section-title">새 시리즈</h2>
        <input name="title" placeholder="시리즈 제목" required />
        <textarea name="description" placeholder="설명 (optional)" rows={2} />
        <button className="button secondary" type="submit" disabled={creatingSeries}>
          시리즈 생성
        </button>
      </form>

      <form className="form-block stack" onSubmit={handleSubmit}>
        <div className="eyebrow">Write Blog Post</div>
        <h2 className="section-title">새 블로그 글</h2>
        <input name="title" placeholder="제목" required />
        <input name="slug" placeholder="slug (optional)" />
        <textarea name="summary" placeholder="요약" rows={3} required />
        <textarea name="content" placeholder="# Markdown&#10;&#10;본문을 입력하세요." rows={10} required />
        <input name="tags" placeholder="태그 (쉼표로 구분, 예: next.js, rsc, perf)" />
        <select name="series_slug" defaultValue="">
          <option value="">시리즈 없음</option>
          {series.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.title}
            </option>
          ))}
        </select>
        <select name="status" defaultValue="published">
          <option value="draft">draft</option>
          <option value="published">published</option>
        </select>
        <button className="button primary" type="submit" disabled={submitting}>
          글 생성
        </button>
      </form>

      <div>
        <div className="eyebrow">Published Posts</div>
        <h2 className="section-title">현재 블로그 글</h2>
        <div className="list">
          {posts.map((post) => (
            <div className="post-list-item" key={post.slug}>
              <span className="post-date">{post.published_at ? "published" : "draft"}</span>
              <h3>{post.title}</h3>
              <p>{post.summary}</p>
              <div className="tag-row">
                {post.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
                <span className="read-time">{post.read_time} min read</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
