"use client";

import { type FormEvent, useState } from "react";

import { createAlbum, uploadAlbumImage, type Album } from "../lib/api";

export function AdminAlbumsManager({
  demoEmail,
  albums,
  onChanged
}: {
  demoEmail: string;
  albums: Album[];
  onChanged?: () => void;
}) {
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleCreateAlbum(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setCreating(true);
    setError(null);

    try {
      await createAlbum(
        {
          title: String(formData.get("title") ?? ""),
          description: String(formData.get("description") ?? ""),
          slug: String(formData.get("slug") ?? "") || undefined
        },
        demoEmail
      );
      setNotice("album created");
      event.currentTarget.reset();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "앨범 생성에 실패했습니다.");
    } finally {
      setCreating(false);
    }
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const albumId = Number(formData.get("albumId"));
    const file = formData.get("file");
    const caption = String(formData.get("caption") ?? "");

    if (!file || typeof file === "string" || file.size === 0) {
      setError("이미지 파일이 필요합니다.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await uploadAlbumImage(albumId, file, caption, demoEmail);
      setNotice("image uploaded");
      event.currentTarget.reset();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="stack">
      <div>
        <div className="eyebrow">Album Admin</div>
        <h1 className="section-title">앨범 관리</h1>
        {notice ? <p className="inline-notice">최근 작업: {notice}</p> : null}
        {error ? <p className="inline-notice">{error}</p> : null}
      </div>

      <div className="grid">
        <form className="form-block stack" onSubmit={handleCreateAlbum}>
          <div className="eyebrow">Create Album</div>
          <h2 className="section-title">새 가족 앨범</h2>
          <input name="title" placeholder="앨범 제목" required />
          <input name="slug" placeholder="slug (optional)" />
          <textarea name="description" placeholder="설명" rows={6} />
          <button className="button primary" type="submit" disabled={creating}>
            앨범 생성
          </button>
        </form>

        <form className="form-block stack" onSubmit={handleUpload}>
          <div className="eyebrow">Upload Image</div>
          <h2 className="section-title">앨범 이미지 업로드</h2>
          <select name="albumId" defaultValue={albums[0]?.id}>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title}
              </option>
            ))}
          </select>
          <input name="caption" placeholder="캡션 (optional)" />
          <input name="file" type="file" accept="image/*" required />
          <button className="button primary" type="submit" disabled={uploading || albums.length === 0}>
            이미지 업로드
          </button>
        </form>
      </div>

      <div>
        <div className="eyebrow">Family Albums</div>
        <h2 className="section-title">현재 앨범</h2>
        <div className="list">
          {albums.map((album) => (
            <div className="post-list-item" key={album.slug}>
              <span className="post-date">{album.item_count} items</span>
              <h3>{album.title}</h3>
              <p>{album.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
