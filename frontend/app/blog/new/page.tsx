"use client";

import { type FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { MarkdownContent } from "../../../components/markdown-content";
import {
  createAdminSeries,
  createBlogPost,
  getAdminBlogPost,
  getSeriesList,
  updateBlogPost,
  type Series
} from "../../../lib/api";
import { canWrite, useSession } from "../../../lib/auth";

// API errors arrive as the raw response body (often `{"detail":"..."}`);
// surface just the human-readable message.
function errorMessage(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : "";
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.detail === "string") {
      return parsed.detail;
    }
  } catch {
    // not JSON — fall through
  }
  return raw || fallback;
}

function WritePost() {
  const { user, demoEmail, loading: sessionLoading } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const editing = editId !== null && editId !== "";

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("# 제목\n\n본문을 입력하세요. 오른쪽에 실시간으로 렌더링됩니다.");
  const [status, setStatus] = useState("draft");
  const [seriesSlug, setSeriesSlug] = useState("");

  const [series, setSeries] = useState<Series[]>([]);
  const [showSeriesForm, setShowSeriesForm] = useState(false);
  const [newSeriesTitle, setNewSeriesTitle] = useState("");
  const [newSeriesDesc, setNewSeriesDesc] = useState("");
  const [creatingSeries, setCreatingSeries] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [loadingPost, setLoadingPost] = useState(editing);
  const [error, setError] = useState<string | null>(null);

  const writer = canWrite(user.role);

  // Auto-dismiss the error toast after a few seconds.
  useEffect(() => {
    if (!error) {
      return;
    }
    const timer = setTimeout(() => setError(null), 6000);
    return () => clearTimeout(timer);
  }, [error]);

  function loadSeries() {
    getSeriesList()
      .then((data) => setSeries(data.items))
      .catch(() => setSeries([]));
  }

  useEffect(() => {
    if (!sessionLoading && writer) {
      loadSeries();
    }
  }, [sessionLoading, writer]);

  // In edit mode, load the existing post once and prefill the form.
  useEffect(() => {
    if (sessionLoading || !writer || !editing) {
      return;
    }
    setLoadingPost(true);
    getAdminBlogPost(Number(editId), demoEmail)
      .then((post) => {
        setTitle(post.title);
        setSummary(post.summary);
        setContent(post.content);
        setTags(post.tags.join(", "));
        setStatus(post.status ?? (post.published_at ? "published" : "draft"));
        setSeriesSlug(post.series?.slug ?? "");
      })
      .catch((err) => setError(errorMessage(err, "글을 불러오지 못했습니다.")))
      .finally(() => setLoadingPost(false));
  }, [sessionLoading, writer, editing, editId, demoEmail]);

  async function handleCreateSeries() {
    if (!newSeriesTitle.trim()) {
      return;
    }
    setCreatingSeries(true);
    setError(null);
    try {
      const created = await createAdminSeries(
        { title: newSeriesTitle.trim(), description: newSeriesDesc.trim() },
        demoEmail
      );
      loadSeries();
      setSeriesSlug(created.slug);
      setNewSeriesTitle("");
      setNewSeriesDesc("");
      setShowSeriesForm(false);
    } catch (err) {
      setError(errorMessage(err, "시리즈 생성에 실패했습니다."));
    } finally {
      setCreatingSeries(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const parsedTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    try {
      if (editing) {
        const updated = await updateBlogPost(
          Number(editId),
          {
            title: title.trim(),
            summary: summary.trim(),
            content,
            status,
            tags: parsedTags,
            series_slug: seriesSlug || null
          },
          demoEmail
        );
        router.push(`/blog/post?slug=${encodeURIComponent(updated.slug)}`);
      } else {
        const created = await createBlogPost(
          {
            title: title.trim(),
            summary: summary.trim(),
            content,
            slug: slug.trim() || undefined,
            status,
            tags: parsedTags,
            series_slug: seriesSlug || undefined
          },
          demoEmail
        );
        router.push(`/blog/post?slug=${encodeURIComponent(created.slug)}`);
      }
    } catch (err) {
      setError(errorMessage(err, "글 저장에 실패했습니다."));
      setSubmitting(false);
    }
  }

  if (sessionLoading || loadingPost) {
    return <p className="empty-state">불러오는 중...</p>;
  }

  if (!writer) {
    return (
      <section className="panel section-card guard">
        <div className="eyebrow">Permission Required</div>
        <h1 className="section-title">작성 권한이 없습니다.</h1>
        <p>블로그 글 작성은 maintainer 또는 admin 권한이 필요합니다.</p>
        <Link className="button secondary" href="/blog">
          블로그로 돌아가기
        </Link>
      </section>
    );
  }

  return (
    <section className="stack">
      <div className="blog-list-header">
        <div>
          <div className="eyebrow">{editing ? "Edit Post" : "New Post"}</div>
          <h1 className="section-title">{editing ? "글 수정" : "새 블로그 글"}</h1>
        </div>
        <Link className="button secondary" href="/blog">
          취소
        </Link>
      </div>

      <form className="stack" onSubmit={handleSubmit}>
        <input
          placeholder="제목"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        {editing ? null : (
          <input
            placeholder="slug (선택 — 비우면 글 번호로 자동 생성)"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
          />
        )}
        <textarea
          placeholder="요약"
          rows={2}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          required
        />
        <input
          placeholder="태그 (쉼표로 구분, 예: next.js, rsc)"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
        />

        <div className="series-row">
          <select value={seriesSlug} onChange={(event) => setSeriesSlug(event.target.value)}>
            <option value="">시리즈 없음</option>
            {series.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.title}
              </option>
            ))}
          </select>
          <button
            className="button secondary"
            type="button"
            onClick={() => setShowSeriesForm((prev) => !prev)}
          >
            {showSeriesForm ? "닫기" : "+ 새 시리즈"}
          </button>
        </div>

        {showSeriesForm ? (
          <div className="form-block stack">
            <input
              placeholder="시리즈 제목"
              value={newSeriesTitle}
              onChange={(event) => setNewSeriesTitle(event.target.value)}
            />
            <input
              placeholder="시리즈 설명 (선택)"
              value={newSeriesDesc}
              onChange={(event) => setNewSeriesDesc(event.target.value)}
            />
            <button
              className="button secondary"
              type="button"
              onClick={handleCreateSeries}
              disabled={creatingSeries || !newSeriesTitle.trim()}
            >
              {creatingSeries ? "생성 중..." : "시리즈 생성"}
            </button>
          </div>
        ) : null}

        <div className="md-editor-grid">
          <div className="stack">
            <div className="eyebrow">Markdown</div>
            <textarea
              className="md-editor-input"
              rows={20}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
            />
          </div>
          <div className="stack">
            <div className="eyebrow">Preview</div>
            <div className="md-editor-preview panel">
              <MarkdownContent source={content} />
            </div>
          </div>
        </div>

        {error ? <p className="action-error">{error}</p> : null}
        <div className="series-row">
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="draft">draft (임시저장)</option>
            <option value="published">published (발행)</option>
          </select>
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting ? "저장 중..." : status === "published" ? "발행하기" : "임시저장"}
          </button>
        </div>
      </form>

      {error ? (
        <div className="toast error" role="alert">
          <span>{error}</span>
          <button type="button" className="toast-close" aria-label="닫기" onClick={() => setError(null)}>
            ×
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default function NewBlogPostPage() {
  return (
    <Suspense fallback={<p className="empty-state">불러오는 중...</p>}>
      <WritePost />
    </Suspense>
  );
}
