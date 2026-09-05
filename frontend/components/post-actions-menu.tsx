"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { deleteBlogPost, type BlogPost } from "../lib/api";

export function PostActionsMenu({
  post,
  demoEmail,
  onChanged
}: {
  post: BlogPost;
  demoEmail?: string;
  onChanged?: () => void;
}) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onDocClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function handleEdit(event: React.MouseEvent) {
    event.preventDefault();
    setOpen(false);
    router.push(`/blog/new?id=${post.id}`);
  }

  async function handleDelete(event: React.MouseEvent) {
    event.preventDefault();
    setOpen(false);
    if (post.id === undefined) {
      return;
    }
    if (!window.confirm(`"${post.title}" 글을 삭제할까요? 되돌릴 수 없습니다.`)) {
      return;
    }
    setBusy(true);
    try {
      await deleteBlogPost(post.id, demoEmail);
      onChanged?.();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="post-menu" ref={ref}>
      <button
        type="button"
        className="post-menu-trigger"
        aria-label="글 관리 메뉴"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={busy}
        onClick={(event) => {
          event.preventDefault();
          setOpen((prev) => !prev);
        }}
      >
        ⋯
      </button>
      {open ? (
        <div className="post-menu-dropdown" role="menu">
          <button type="button" role="menuitem" onClick={handleEdit}>
            수정
          </button>
          <button type="button" role="menuitem" className="danger" onClick={handleDelete}>
            삭제
          </button>
        </div>
      ) : null}
    </div>
  );
}
