import { notFound } from "next/navigation";
import { getAlbum } from "../../../lib/api";
import { canAccessFamily, loadSessionForDemo } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export default async function AlbumDetailPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const { user, demoEmail } = await loadSessionForDemo(searchParams);
  const allowed = canAccessFamily(user.role, user.familyAccess);

  if (!allowed) {
    return (
      <section className="panel section-card guard">
        <div className="eyebrow">Access Denied</div>
        <h2 className="section-title">보호된 앨범 상세에 접근할 수 없습니다.</h2>
      </section>
    );
  }

  const album = await getAlbum(params.slug, demoEmail);

  if (!album) {
    notFound();
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
              <img
                className="album-image"
                src={`/api/assets/${item.asset_id}`}
                alt={item.caption || `Image #${item.id}`}
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
