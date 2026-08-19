"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getAlbums, type Album } from "../../lib/api";
import { canAccessFamily, useSession } from "../../lib/auth";

export default function AlbumPage() {
  const { user, demoEmail, loading: sessionLoading } = useSession();
  const [items, setItems] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const allowed = canAccessFamily(user.role, user.familyAccess);

  useEffect(() => {
    if (sessionLoading || !allowed) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getAlbums(demoEmail)
      .then((data) => setItems(data.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [sessionLoading, allowed, demoEmail]);

  if (sessionLoading) {
    return <p className="empty-state">불러오는 중...</p>;
  }

  if (!allowed) {
    return (
      <section className="panel section-card guard">
        <div className="eyebrow">Access Denied</div>
        <h2 className="section-title">가족 앨범 권한이 없습니다.</h2>
        <p>
          현재 세션: <code>{user.email}</code>. 로그인만으로는 접근되지 않으며,
          승인된 family 권한이 필요합니다.
        </p>
      </section>
    );
  }

  return (
    <section className="panel section-card">
      <div className="eyebrow">Authorized</div>
      <h2 className="section-title">Albums</h2>
      {loading ? (
        <p className="empty-state">불러오는 중...</p>
      ) : (
        <div className="list">
          {items.map((album) => (
            <Link
              key={album.slug}
              className="card-link"
              href={`/album/detail?slug=${encodeURIComponent(album.slug)}`}
            >
              <span className="badge">{album.item_count} items</span>
              <h3>{album.title}</h3>
              <p>{album.description}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
