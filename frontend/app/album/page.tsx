import Link from "next/link";
import { getAlbums } from "../../lib/api";
import { canAccessFamily, loadSessionForDemo } from "../../lib/auth";

export const dynamic = "force-dynamic";

export default async function AlbumPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const { user, demoEmail } = await loadSessionForDemo(searchParams);
  const allowed = canAccessFamily(user.role, user.familyAccess);

  if (!allowed) {
    return (
      <section className="panel section-card guard">
        <div className="eyebrow">Access Denied</div>
        <h2 className="section-title">가족 앨범 권한이 없습니다.</h2>
        <p>
          현재 세션: <code>{demoEmail ?? "anonymous"}</code>. 로그인만으로는 접근되지 않으며,
          승인된 family 권한이 필요합니다.
        </p>
      </section>
    );
  }

  const data = await getAlbums(demoEmail);
  const items = data?.items ?? [];

  return (
    <section className="panel section-card">
      <div className="eyebrow">Authorized</div>
      <h2 className="section-title">Albums</h2>
      <div className="list">
        {items.map((album) => (
          <Link key={album.slug} className="card-link" href={`/album/${album.slug}`}>
            <span className="badge">{album.item_count} items</span>
            <h3>{album.title}</h3>
            <p>{album.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
