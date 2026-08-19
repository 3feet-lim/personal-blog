"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminAlbumsManager } from "../../../components/admin-albums-manager";
import { getAlbums, type Album } from "../../../lib/api";
import { isAdmin, useSession } from "../../../lib/auth";

export default function AdminAlbumsPage() {
  const { user, demoEmail, loading: sessionLoading } = useSession();
  const admin = isAdmin(user.role);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getAlbums(demoEmail)
      .then((data) => setAlbums(data.items))
      .catch(() => setAlbums([]))
      .finally(() => setLoading(false));
  }, [demoEmail]);

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

  return <AdminAlbumsManager demoEmail={demoEmail ?? "admin@example.com"} albums={albums} onChanged={load} />;
}
