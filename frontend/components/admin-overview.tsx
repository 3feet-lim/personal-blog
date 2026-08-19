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
          <span className="badge">posts: {posts.length}</span>
          <span className="badge">albums: {albums.length}</span>
        </div>
      </div>

      <div className="list">
        <Link className="post-list-item" href="/admin/blog">
          <span className="post-date">Content</span>
          <h3>블로그 관리</h3>
          <p>새 글 작성과 현재 게시물 확인</p>
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
