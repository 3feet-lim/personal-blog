"use client";

import { useEffect, useMemo, useState } from "react";

import { AuthorizedImage } from "../../components/authorized-image";
import { getFamilyFeed, type FamilyFeed, type FamilyFeedItem } from "../../lib/api";
import { canAccessFamily, useSession } from "../../lib/auth";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

function formatDay(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function groupByMonth(items: FamilyFeedItem[]) {
  const groups = new Map<number, FamilyFeedItem[]>();
  for (const item of items) {
    const month = new Date(item.created_at).getMonth();
    const bucket = groups.get(month) ?? [];
    bucket.push(item);
    groups.set(month, bucket);
  }
  return Array.from(groups.entries()).sort((a, b) => b[0] - a[0]);
}

export default function FamilyFeedPage() {
  const { user, demoEmail, loading: sessionLoading } = useSession();
  const allowed = canAccessFamily(user.role, user.familyAccess);

  const [feed, setFeed] = useState<FamilyFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    if (sessionLoading || !allowed) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getFamilyFeed(demoEmail)
      .then((data) => {
        setFeed(data);
        setSelectedYear(data.years[0] ?? null);
      })
      .catch(() => setFeed(null))
      .finally(() => setLoading(false));
  }, [sessionLoading, allowed, demoEmail]);

  const filteredItems = useMemo(() => {
    if (!feed || selectedYear === null) {
      return [];
    }
    return feed.items.filter((item) => new Date(item.created_at).getFullYear() === selectedYear);
  }, [feed, selectedYear]);

  const monthGroups = useMemo(() => groupByMonth(filteredItems), [filteredItems]);

  if (sessionLoading) {
    return <p className="empty-state">불러오는 중...</p>;
  }

  if (!allowed) {
    return (
      <section className="guard">
        <div className="eyebrow">Access Denied</div>
        <h2 className="section-title">가족 앨범 권한이 없습니다.</h2>
        <p>
          현재 세션: <code>{user.email}</code>. 로그인만으로는 접근되지 않으며, 승인된 family
          권한이 필요합니다.
        </p>
      </section>
    );
  }

  if (loading) {
    return <p className="empty-state">불러오는 중...</p>;
  }

  if (!feed || feed.items.length === 0) {
    return (
      <section>
        <div className="eyebrow">Private · {feed?.approved_family_count ?? 0}명만 볼 수 있어요</div>
        <h1 className="section-title">우리 집 기록</h1>
        <p className="empty-state">표시할 사진이 없습니다.</p>
      </section>
    );
  }

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="eyebrow">Private · 승인된 {feed.approved_family_count}명만 볼 수 있어요</div>
          <h1 className="section-title">우리 집 기록</h1>
        </div>
        <div className="year-filter-row">
          {feed.years.map((year) => (
            <button
              key={year}
              type="button"
              className={`year-pill ${selectedYear === year ? "active" : ""}`}
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {monthGroups.map(([month, monthItems]) => (
        <div className="month-group" key={month}>
          <div className="month-heading">
            <span>{MONTH_NAMES[month]}</span>
            <span className="entry-count">{monthItems.length} entries</span>
          </div>
          <div className="album-grid">
            {monthItems.map((item) => (
              <div className="feed-item" key={item.id}>
                {item.asset_id ? (
                  <AuthorizedImage
                    assetId={item.asset_id}
                    alt={item.caption || item.album_title}
                    demoEmail={demoEmail}
                    className="album-image"
                  />
                ) : (
                  <div className="album-image" />
                )}
                <span className="feed-item-date">{formatDay(item.created_at)}</span>
                {item.caption ? <p>{item.caption}</p> : null}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
