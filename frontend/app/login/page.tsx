"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiUrl } from "../../lib/config";
import { devLogin, getAuthProviders, type AuthProvider } from "../../lib/api";
import { clearStoredDemoEmail, getStoredDemoEmail, setStoredDemoEmail, useSession } from "../../lib/auth";

const DEMO_USERS = [
  { email: "family@example.com", label: "가족 사용자 세션 시작", next: "/family", variant: "primary" as const },
  { email: "admin@example.com", label: "관리자 세션 시작", next: "/admin", variant: "secondary" as const },
  { email: "guest@example.com", label: "승인 안 된 사용자 세션 시작", next: "/family", variant: "warn" as const }
];

export default function LoginPage() {
  const router = useRouter();
  const { demoEmail, reload } = useSession();
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    getAuthProviders()
      .then((data) => setProviders(data.providers))
      .catch(() => setProviders([]));
  }, []);

  const google = providers.find((provider) => provider.name === "google");

  async function startDemoSession(email: string, nextPath: string) {
    setPending(email);
    setError(null);
    try {
      await devLogin(email);
      setStoredDemoEmail(email);
      await reload();
      router.push(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setPending(null);
    }
  }

  async function endDemoSession() {
    clearStoredDemoEmail();
    await reload();
  }

  const currentDemoEmail = demoEmail ?? getStoredDemoEmail();

  return (
    <div className="grid">
      <section className="form-block">
        <div className="eyebrow">Real Login</div>
        <h1 className="section-title">로그인 정책</h1>
        <p>
          Google OAuth가 설정된 환경에서는 이 경로가 실제 로그인 진입점입니다. 승인된 사용자는
          로그인 후 역할에 맞는 보호 영역으로 이동하고, 승인되지 않은 사용자는 백엔드에서
          차단됩니다.
        </p>
        <div className="kv">
          <strong>Status</strong>
          <code>{google?.status ?? "unknown"}</code>
          <code>{google?.configured ? "configured" : "missing env"}</code>
        </div>
        <div className="cta-row">
          <a
            className={`button ${google?.configured ? "primary" : "secondary"}`}
            href={google?.configured ? `${apiUrl}${google.login_url}` : "#"}
          >
            Google 로그인 시작
          </a>
        </div>
      </section>

      <section className="form-block">
        <div className="eyebrow">Local Demo Only</div>
        <h2 className="section-title">개발용 빠른 진입</h2>
        <p>
          아래 데모 세션은 로컬 개발 검증용입니다. 실제 사용자 로그인 대체가 아니라, 권한 경계를
          빠르게 확인하기 위한 개발 보조 수단입니다.
        </p>
        <div className="kv">
          <strong>Current</strong>
          <code>{currentDemoEmail ?? "anonymous"}</code>
          <strong>Demo Users</strong>
          <code>family@example.com</code>
          <code>admin@example.com</code>
          <code>guest@example.com</code>
        </div>
        {error ? <p className="inline-notice error">{error}</p> : null}
        <div className="stack">
          {DEMO_USERS.map((demoUser) => (
            <div className="cta-row" key={demoUser.email}>
              <button
                className={`button ${demoUser.variant}`}
                type="button"
                disabled={pending === demoUser.email}
                onClick={() => startDemoSession(demoUser.email, demoUser.next)}
              >
                {demoUser.label}
              </button>
            </div>
          ))}
          {currentDemoEmail ? (
            <div className="cta-row">
              <button className="button secondary" type="button" onClick={endDemoSession}>
                데모 세션 종료
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
