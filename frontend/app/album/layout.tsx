import Link from "next/link";

export default function AlbumLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="stack">
      <div className="panel section-card guard">
        <div className="eyebrow">Protected Area</div>
        <h1 className="section-title">Family Album</h1>
        <p>
          이 영역은 승인 사용자 전용입니다. 로컬 데모 모드에서는 로그인 페이지에서 선택한
          프런트 세션 쿠키를 기준으로 접근 상태를 유지합니다.
        </p>
        <div className="cta-row">
          <Link className="button secondary" href="/login">
            로그인 가이드
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
