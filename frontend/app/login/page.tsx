import Link from "next/link";
import { getAuthProviders } from "../../lib/api";
import { loadSessionForDemo } from "../../lib/auth";
import { browserBackendUrl } from "../../lib/config";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const providerData = await getAuthProviders();
  const google = providerData?.providers.find((provider) => provider.name === "google");
  const { demoEmail } = await loadSessionForDemo(searchParams);
  const oauthState = typeof searchParams?.oauth === "string" ? searchParams.oauth : undefined;

  return (
    <div className="grid">
      <section className="panel section-card">
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
        {oauthState ? <p className="inline-notice">OAuth 상태: {oauthState}</p> : null}
        <div className="cta-row">
          <a
            className={`button ${google?.configured ? "primary" : "secondary"}`}
            href={google?.configured ? `${browserBackendUrl}${google.login_url}` : "#"}
          >
            Google 로그인 시작
          </a>
        </div>
      </section>

      <section className="panel section-card">
        <div className="eyebrow">Local Demo Only</div>
        <h2 className="section-title">개발용 빠른 진입</h2>
        <p>
          아래 데모 세션은 로컬 개발 검증용입니다. 실제 사용자 로그인 대체가 아니라, 권한 경계를
          빠르게 확인하기 위한 개발 보조 수단입니다.
        </p>
        <div className="kv">
          <strong>Current</strong>
          <code>{demoEmail ?? "anonymous"}</code>
          <strong>Demo Users</strong>
          <code>family@example.com</code>
          <code>admin@example.com</code>
          <code>guest@example.com</code>
        </div>
        <div className="stack">
          <form action="/auth/demo-login" method="post" className="cta-row">
            <input type="hidden" name="email" value="family@example.com" />
            <input type="hidden" name="nextPath" value="/album" />
            <button className="button primary" type="submit">
              가족 사용자 세션 시작
            </button>
          </form>
          <form action="/auth/demo-login" method="post" className="cta-row">
            <input type="hidden" name="email" value="admin@example.com" />
            <input type="hidden" name="nextPath" value="/admin" />
            <button className="button secondary" type="submit">
              관리자 세션 시작
            </button>
          </form>
          <form action="/auth/demo-login" method="post" className="cta-row">
            <input type="hidden" name="email" value="guest@example.com" />
            <input type="hidden" name="nextPath" value="/album" />
            <button className="button warn" type="submit">
              승인 안 된 사용자 세션 시작
            </button>
          </form>
          {demoEmail ? (
            <form action="/auth/demo-logout" method="post" className="cta-row">
              <button className="button secondary" type="submit">
                데모 세션 종료
              </button>
            </form>
          ) : null}
        </div>
      </section>
    </div>
  );
}
