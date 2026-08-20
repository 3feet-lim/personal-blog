"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminSettingsManager } from "../../../components/admin-settings-manager";
import { getSiteSettings, type SiteSettings } from "../../../lib/api";
import { isAdmin, useSession } from "../../../lib/auth";

export default function AdminSettingsPage() {
  const { user, demoEmail, loading: sessionLoading } = useSession();
  const admin = isAdmin(user.role);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getSiteSettings()
      .then((data) => setSettings(data))
      .catch(() => setSettings(null))
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

  if (!settings) {
    return <p className="empty-state">설정을 불러오지 못했습니다.</p>;
  }

  return (
    <AdminSettingsManager demoEmail={demoEmail ?? "admin@example.com"} settings={settings} onChanged={load} />
  );
}
