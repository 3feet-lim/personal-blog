"use client";

import { useEffect, useState } from "react";

import { AdminOverview } from "../../components/admin-overview";
import { getAlbums, getBlogPosts, type Album, type BlogPost } from "../../lib/api";
import { isAdmin, useSession } from "../../lib/auth";

export default function AdminPage() {
  const { user, demoEmail, loading: sessionLoading } = useSession();
  const admin = isAdmin(user.role);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading || !admin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([getBlogPosts(), getAlbums(demoEmail)])
      .then(([postsData, albumsData]) => {
        setPosts(postsData.items);
        setAlbums(albumsData.items);
      })
      .catch(() => {
        setPosts([]);
        setAlbums([]);
      })
      .finally(() => setLoading(false));
  }, [sessionLoading, admin, demoEmail]);

  if (sessionLoading) {
    return <p className="empty-state">불러오는 중...</p>;
  }

  if (!admin) {
    return (
      <section className="panel section-card guard">
        <div className="eyebrow">Admin Only</div>
        <h1 className="section-title">관리자 권한이 필요합니다.</h1>
        <p>
          현재 세션: <code>{user.email}</code>
        </p>
      </section>
    );
  }

  if (loading) {
    return <p className="empty-state">불러오는 중...</p>;
  }

  return <AdminOverview demoEmail={demoEmail ?? "admin@example.com"} user={user} posts={posts} albums={albums} />;
}
