import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="panel hero-copy">
          <div className="eyebrow">Public + Private</div>
          <h1>기술 기록과 가족 앨범을 한 홈에서 분리합니다.</h1>
          <p>
            공개 기술 블로그는 누구나 읽을 수 있고, 가족 앨범은 승인된 사용자만 접근합니다.
            MVP는 이 경계를 가장 중요한 제품 규칙으로 둡니다.
          </p>
          <div className="cta-row">
            <Link className="button primary" href="/blog">
              Tech Blog 보기
            </Link>
            <Link className="button secondary" href="/album">
              Family Album 입장
            </Link>
          </div>
        </div>
        <div className="panel hero-card">
          <div className="eyebrow">MVP Principles</div>
          <div className="stack">
            <div>
              <span className="badge">Public</span>
              <h3>Tech Blog</h3>
              <p>Markdown 기반 포스트, 공개 읽기, 관리자 작성.</p>
            </div>
            <div>
              <span className="badge">Protected</span>
              <h3>Family Album</h3>
              <p>Google SSO 확장 전제를 가진 승인 사용자 전용 이미지 앨범.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid">
        <article className="panel section-card">
          <div className="eyebrow">01</div>
          <h2 className="section-title">Tech Blog</h2>
          <p>
            프로젝트 노트, 아키텍처 정리, 구현 메모를 공개 영역에 유지합니다. 인증 없이 바로
            접근할 수 있습니다.
          </p>
          <div className="cta-row">
            <Link className="button primary" href="/blog">
              블로그로 이동
            </Link>
          </div>
        </article>

        <article className="panel section-card guard">
          <div className="eyebrow">02</div>
          <h2 className="section-title">Family Album</h2>
          <p>
            가족 앨범은 승인 사용자 전용입니다. 로그인 성공만으로는 부족하고, 내부 allowlist
            승인과 family 접근 권한이 필요합니다.
          </p>
          <div className="cta-row">
            <Link className="button warn" href="/login">
              로그인
            </Link>
            <Link className="button secondary" href="/album">
              접근 상태 확인
            </Link>
          </div>
        </article>
      </section>
    </>
  );
}
