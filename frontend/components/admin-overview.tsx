import Link from "next/link";

import type { Album, BlogPost, SessionUser } from "../lib/api";

export function AdminOverview({
  demoEmail,
  user,
  posts,
  albums
}: {
  demoEmail: string;
  user: SessionUser;
  posts: BlogPost[];
  albums: Album[];
}) {
  // `posts` now includes drafts (admin list), so show the published subset
  // explicitly rather than a bare total that reads as "publicly live".
  const publishedCount = posts.filter(
    (post) => (post.status ?? (post.published_at ? "published" : "draft")) === "published"
  ).length;

  return (
    <section className="stack">
      <div>
        <div className="eyebrow">Admin Overview</div>
        <h1 className="section-title">관리자 대시보드</h1>
        <p>
          현재 세션은 <code>{demoEmail}</code> 입니다. 관리자 작업을 섹션별로 분리해 이동할 수
          있습니다.
        </p>
        <div className="meta-row">
          <span className="badge">{user.name}</span>
          <span className="badge">role: {user.role}</span>
          <span className="badge">posts: {posts.length} (발행 {publishedCount})</span>
          <span className="badge">albums: {albums.length}</span>
        </div>
      </div>

      <div className="list">
        <Link className="post-list-item" href="/blog">
          <span className="post-date">Content</span>
          <h3>블로그</h3>
          <p>글 작성·수정·삭제는 블로그 화면에서</p>
        </Link>
        <Link className="post-list-item" href="/admin/albums">
          <span className="post-date">Storage</span>
          <h3>앨범 관리</h3>
          <p>앨범 생성과 이미지 업로드</p>
        </Link>
        <Link className="post-list-item" href="/admin/users">
          <span className="post-date">Access</span>
          <h3>사용자 권한</h3>
          <p>승인, family access, admin 권한 조정</p>
        </Link>
      </div>
    </section>
  );
}
