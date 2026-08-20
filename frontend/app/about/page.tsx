import { appName, siteSubtitle } from "../../lib/config";

export default function AboutPage() {
  return (
    <section>
      <div className="eyebrow">About</div>
      <h1 className="section-title">{appName}</h1>
      <p className="empty-state">{siteSubtitle}</p>
      <p className="empty-state">
        엔지니어링 노트와 가족 앨범을 함께 담은 개인 블로그입니다. Tech 피드에는 개발 관련 글을,
        Family 피드에는 승인된 가족만 볼 수 있는 사진과 기록을 남깁니다.
      </p>
    </section>
  );
}
