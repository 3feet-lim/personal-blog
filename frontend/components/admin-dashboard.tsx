import {
  createAlbumAction,
  createBlogPostAction,
  updateUserAccessAction,
  uploadAlbumImageAction
} from "../app/admin/actions";
import type { Album, BlogPost, SessionUser } from "../lib/api";

type AdminUser = {
  id: number;
  email: string;
  display_name: string;
  role: string;
  approved: boolean;
  family_access: boolean;
};

export function AdminDashboard({
  demoEmail,
  notice,
  user,
  users,
  posts,
  albums
}: {
  demoEmail: string;
  notice?: string;
  user: SessionUser;
  users: AdminUser[];
  posts: BlogPost[];
  albums: Album[];
}) {
  return (
    <section className="stack">
      <div className="panel section-card">
        <div className="eyebrow">Dashboard</div>
        <h1 className="section-title">Admin Shell</h1>
        <p>
          현재 세션은 <code>{demoEmail}</code> 입니다. 블로그 글, 앨범, 사용자 권한을 여기서
          바로 조정할 수 있습니다.
        </p>
        <div className="meta-row">
          <span className="badge">{user.name}</span>
          <span className="badge">role: {user.role}</span>
        </div>
        {notice ? <p className="inline-notice">최근 작업: {notice}</p> : null}
      </div>

      <div className="grid">
        <form className="panel section-card stack" action={createBlogPostAction}>
          <input type="hidden" name="demoEmail" value={demoEmail} />
          <div className="eyebrow">Write Blog Post</div>
          <h2 className="section-title">새 블로그 글</h2>
          <input name="title" placeholder="제목" required />
          <input name="slug" placeholder="slug (optional)" />
          <textarea name="summary" placeholder="요약" rows={3} required />
          <textarea
            name="content"
            placeholder="# Markdown&#10;&#10;본문을 입력하세요."
            rows={10}
            required
          />
          <select name="status" defaultValue="published">
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
          <button className="button primary" type="submit">
            글 생성
          </button>
        </form>

        <form className="panel section-card stack" action={createAlbumAction}>
          <input type="hidden" name="demoEmail" value={demoEmail} />
          <div className="eyebrow">Create Album</div>
          <h2 className="section-title">새 가족 앨범</h2>
          <input name="title" placeholder="앨범 제목" required />
          <input name="slug" placeholder="slug (optional)" />
          <textarea name="description" placeholder="설명" rows={6} />
          <button className="button primary" type="submit">
            앨범 생성
          </button>
        </form>
      </div>

      <div className="grid">
        <div className="panel section-card">
          <div className="eyebrow">Published Posts</div>
          <h2 className="section-title">현재 블로그 글</h2>
          <div className="list">
            {posts.map((post) => (
              <div className="card-link" key={post.slug}>
                <span className="badge">{post.published_at ? "published" : "draft"}</span>
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
              </div>
            ))}
          </div>
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
      </div>

      <form className="panel section-card stack" action={uploadAlbumImageAction}>
        <input type="hidden" name="demoEmail" value={demoEmail} />
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

      <div className="panel section-card">
        <div className="eyebrow">Access Control</div>
        <h2 className="section-title">사용자 승인/권한</h2>
        <div className="list">
          {users.map((member) => (
            <form className="card-link stack" key={member.id} action={updateUserAccessAction}>
              <input type="hidden" name="demoEmail" value={demoEmail} />
              <input type="hidden" name="userId" value={member.id} />
              <div>
                <h3>{member.display_name}</h3>
                <p>{member.email}</p>
              </div>
              <select name="role" defaultValue={member.role}>
                <option value="member">member</option>
                <option value="admin">admin</option>
              </select>
              <label>
                <input type="checkbox" name="approved" defaultChecked={member.approved} /> approved
              </label>
              <label>
                <input
                  type="checkbox"
                  name="family_access"
                  defaultChecked={member.family_access}
                />{" "}
                family access
              </label>
              <button className="button secondary" type="submit">
                권한 저장
              </button>
            </form>
          ))}
        </div>
      </div>
    </section>
  );
}
