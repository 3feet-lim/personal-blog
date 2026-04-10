import { createAlbumAction, uploadAlbumImageAction } from "../app/admin/actions";
import type { Album } from "../lib/api";

export function AdminAlbumsManager({
  demoEmail,
  albums,
  notice
}: {
  demoEmail: string;
  albums: Album[];
  notice?: string;
}) {
  return (
    <section className="stack">
      <div className="panel section-card">
        <div className="eyebrow">Album Admin</div>
        <h1 className="section-title">앨범 관리</h1>
        {notice ? <p className="inline-notice">최근 작업: {notice}</p> : null}
      </div>

      <div className="grid">
        <form className="panel section-card stack" action={createAlbumAction}>
          <input type="hidden" name="demoEmail" value={demoEmail} />
          <input type="hidden" name="returnTo" value="/admin/albums" />
          <div className="eyebrow">Create Album</div>
          <h2 className="section-title">새 가족 앨범</h2>
          <input name="title" placeholder="앨범 제목" required />
          <input name="slug" placeholder="slug (optional)" />
          <textarea name="description" placeholder="설명" rows={6} />
          <button className="button primary" type="submit">
            앨범 생성
          </button>
        </form>

        <form className="panel section-card stack" action={uploadAlbumImageAction}>
          <input type="hidden" name="demoEmail" value={demoEmail} />
          <input type="hidden" name="returnTo" value="/admin/albums" />
          <div className="eyebrow">Upload To MinIO</div>
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
          <button className="button primary" type="submit" disabled={albums.length === 0}>
            이미지 업로드
          </button>
        </form>
      </div>

      <div className="panel section-card">
        <div className="eyebrow">Family Albums</div>
        <h2 className="section-title">현재 앨범</h2>
        <div className="list">
          {albums.map((album) => (
            <div className="card-link" key={album.slug}>
              <span className="badge">{album.item_count} items</span>
              <h3>{album.title}</h3>
              <p>{album.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
