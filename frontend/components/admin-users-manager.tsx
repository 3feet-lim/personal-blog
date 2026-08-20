"use client";

import { type FormEvent, useEffect, useState } from "react";

import { ApiError, createAdminUser, updateUserAccess, type AdminUser } from "../lib/api";

const NOTICE_DURATION_MS = 5000;

type Notice = { type: "success" | "error"; text: string };

function useAutoDismissNotice() {
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (!notice) {
      return;
    }
    const timer = setTimeout(() => setNotice(null), NOTICE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  return [notice, setNotice] as const;
}

function describeCreateUserError(err: unknown): string {
  if (err instanceof ApiError && err.status === 409) {
    return "이미 등록된 이메일입니다.";
  }
  if (err instanceof ApiError && err.status === 422) {
    return "입력값을 확인해주세요. (이메일 형식 또는 권한 값)";
  }
  return err instanceof Error ? err.message : "사용자 등록에 실패했습니다.";
}

export function AdminUsersManager({
  demoEmail,
  users,
  onChanged
}: {
  demoEmail: string;
  users: AdminUser[];
  onChanged?: () => void;
}) {
  const [createNotice, setCreateNotice] = useAutoDismissNotice();
  const [accessNotice, setAccessNotice] = useAutoDismissNotice();
  const [savingId, setSavingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "");
    setCreating(true);

    try {
      await createAdminUser(
        {
          email,
          display_name: String(formData.get("display_name") ?? "") || undefined,
          role: String(formData.get("role") ?? "member"),
          family_access: formData.get("family_access") === "on"
        },
        demoEmail
      );
      setCreateNotice({ type: "success", text: `${email} 사용자를 등록했습니다.` });
      form.reset();
      onChanged?.();
    } catch (err) {
      setCreateNotice({ type: "error", text: describeCreateUserError(err) });
    } finally {
      setCreating(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>, userId: number) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSavingId(userId);

    try {
      await updateUserAccess(
        userId,
        {
          role: String(formData.get("role") ?? "member"),
          approved: formData.get("approved") === "on",
          family_access: formData.get("family_access") === "on"
        },
        demoEmail
      );
      setAccessNotice({ type: "success", text: "권한을 저장했습니다." });
      onChanged?.();
    } catch (err) {
      setAccessNotice({
        type: "error",
        text: err instanceof Error ? err.message : "권한 저장에 실패했습니다."
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="stack">
      <div>
        <div className="eyebrow">Access Control</div>
        <h1 className="section-title">사용자 권한</h1>
      </div>

      <form className="form-block stack" onSubmit={handleCreate}>
        <div className="eyebrow">Pre-approve User</div>
        <h2 className="section-title">사용자 사전 승인 등록</h2>
        <p>
          회원가입은 지원하지 않습니다. 여기서 등록한 이메일만 Google 로그인 후 접근할 수
          있습니다.
        </p>
        <input name="email" type="email" placeholder="user@example.com" required />
        <input name="display_name" placeholder="표시 이름 (optional)" />
        <select name="role" defaultValue="member">
          <option value="member">member</option>
          <option value="admin">admin</option>
        </select>
        <label>
          <input type="checkbox" name="family_access" /> family access
        </label>
        <button className="button primary" type="submit" disabled={creating}>
          사용자 등록
        </button>
        {createNotice ? (
          <p className={`inline-notice ${createNotice.type}`}>{createNotice.text}</p>
        ) : null}
      </form>

      <div>
        {accessNotice ? (
          <p className={`inline-notice ${accessNotice.type}`}>{accessNotice.text}</p>
        ) : null}
        <div className="list">
          {users.map((member) => (
            <form
              className="form-block stack"
              key={member.id}
              onSubmit={(event) => handleSubmit(event, member.id)}
              style={{ marginBottom: 12 }}
            >
              <div>
                <h3>{member.display_name}</h3>
                <p>{member.email}</p>
              </div>
              <select name="role" defaultValue={member.role}>
                <option value="member">member</option>
                <option value="admin">admin</option>
              </select>
              <label>
                <input type="checkbox" name="approved" defaultChecked={member.approved} /> approved
              </label>
              <label>
                <input type="checkbox" name="family_access" defaultChecked={member.family_access} /> family access
              </label>
              <button className="button secondary" type="submit" disabled={savingId === member.id}>
                권한 저장
              </button>
            </form>
          ))}
        </div>
      </div>
    </section>
  );
}
