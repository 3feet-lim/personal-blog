import Link from "next/link";
import { getAuthProviders } from "../../lib/api";
import { loadSessionForDemo } from "../../lib/auth";
import { backendUrl } from "../../lib/config";

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
        <div className="eyebrow">Google OAuth</div>
        <h1 className="section-title">로그인 정책</h1>
        <p>
          백엔드는 Google OAuth 시작/콜백 엔드포인트를 갖고 있고, 환경 변수가 채워지면 실제
          연동으로 전환할 수 있습니다. 현재 로컬에서는 데모 세션과 함께 병행 사용합니다.
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
            href={google?.configured ? `${backendUrl}${google.login_url}` : "#"}
          >
            Google 로그인 시작
          </a>
        </div>
      </section>

      <section className="panel section-card">
        <div className="eyebrow">Demo Session</div>
        <h2 className="section-title">개발용 빠른 진입</h2>
        <p>
          이제 데모 모드는 프런트 세션 쿠키 기반으로 유지됩니다. 한 번 선택하면 쿼리스트링 없이
          보호 영역과 admin 화면을 바로 검증할 수 있습니다.
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
