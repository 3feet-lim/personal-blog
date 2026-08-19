"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminUsersManager } from "../../../components/admin-users-manager";
import { getAdminUsers, type AdminUser } from "../../../lib/api";
import { isAdmin, useSession } from "../../../lib/auth";

export default function AdminUsersPage() {
  const { user, demoEmail, loading: sessionLoading } = useSession();
  const admin = isAdmin(user.role);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getAdminUsers(demoEmail)
      .then((data) => setUsers(data.items))
      .catch(() => setUsers([]))
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

  return <AdminUsersManager demoEmail={demoEmail ?? "admin@example.com"} users={users} onChanged={load} />;
}
