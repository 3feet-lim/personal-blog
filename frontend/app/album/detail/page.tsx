"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AuthorizedImage } from "../../../components/authorized-image";
import { getAlbum, type AlbumDetail } from "../../../lib/api";
import { canAccessFamily, useSession } from "../../../lib/auth";

function AlbumDetailView() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? "";
  const { user, demoEmail, loading: sessionLoading } = useSession();
  const allowed = canAccessFamily(user.role, user.familyAccess);

  const [album, setAlbum] = useState<AlbumDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (sessionLoading || !allowed || !slug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);
    getAlbum(slug, demoEmail)
      .then((data) => setAlbum(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [sessionLoading, allowed, slug, demoEmail]);

  if (sessionLoading || loading) {
    return <p className="empty-state">불러오는 중...</p>;
  }

  if (!allowed) {
    return (
      <section className="panel section-card guard">
        <div className="eyebrow">Access Denied</div>
        <h2 className="section-title">보호된 앨범 상세에 접근할 수 없습니다.</h2>
      </section>
    );
  }

  if (notFound || !album) {
    return (
      <section className="panel section-card guard">
        <div className="eyebrow">Not Found</div>
        <h2 className="section-title">앨범을 찾을 수 없습니다.</h2>
      </section>
    );
  }

  return (
    <section className="panel detail-card">
      <div className="eyebrow">Protected Album</div>
      <h1>{album.title}</h1>
      <p>{album.description}</p>
      <div className="album-grid">
        {album.items.map((item) => (
          <div key={item.id} className="card-link">
            <span className="badge">Private Asset</span>
            <h3>{item.caption || `Image #${item.id}`}</h3>
            {item.asset_id ? (
              <AuthorizedImage
                assetId={item.asset_id}
                alt={item.caption || `Image #${item.id}`}
                demoEmail={demoEmail}
                className="album-image"
              />
            ) : (
              <p>연결된 자산 없음</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AlbumDetailPage() {
  return (
    <Suspense fallback={<p className="empty-state">불러오는 중...</p>}>
      <AlbumDetailView />
    </Suspense>
  );
}
