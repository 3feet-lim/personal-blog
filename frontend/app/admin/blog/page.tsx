"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminBlogManager } from "../../../components/admin-blog-manager";
import { getBlogPosts, type BlogPost } from "../../../lib/api";
import { isAdmin, useSession } from "../../../lib/auth";

export default function AdminBlogPage() {
  const { user, demoEmail, loading: sessionLoading } = useSession();
  const admin = isAdmin(user.role);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getBlogPosts()
      .then((data) => setPosts(data.items))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (sessionLoading || !admin) {
      setLoading(false);
      return;
    }
    load();
  }, [sessionLoading, admin, load]);

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

  return <AdminBlogManager demoEmail={demoEmail ?? "admin@example.com"} posts={posts} onCreated={load} />;
}
