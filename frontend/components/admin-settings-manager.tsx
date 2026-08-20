"use client";

import { type FormEvent, useState } from "react";

import { updateSiteSettings, type SiteSettings } from "../lib/api";

export function AdminSettingsManager({
  demoEmail,
  settings,
  onChanged
}: {
  demoEmail: string;
  settings: SiteSettings;
  onChanged?: () => void;
}) {
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setSaving(true);
    setNotice(null);
    setError(null);

    try {
      await updateSiteSettings(
        {
          site_name: String(formData.get("site_name") ?? ""),
          site_subtitle: String(formData.get("site_subtitle") ?? ""),
          footer_text: String(formData.get("footer_text") ?? ""),
          github_url: String(formData.get("github_url") ?? ""),
          mastodon_url: String(formData.get("mastodon_url") ?? "")
        },
        demoEmail
      );
      setNotice("설정을 저장했습니다.");
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "설정 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="stack">
      <div>
        <div className="eyebrow">Site Settings</div>
        <h1 className="section-title">사이트 설정</h1>
        {notice ? <p className="inline-notice success">{notice}</p> : null}
        {error ? <p className="inline-notice error">{error}</p> : null}
      </div>

      <form className="form-block stack" onSubmit={handleSubmit}>
        <input name="site_name" placeholder="사이트 이름" defaultValue={settings.site_name} required />
        <input name="site_subtitle" placeholder="서브타이틀" defaultValue={settings.site_subtitle} />
        <input name="footer_text" placeholder="푸터 텍스트" defaultValue={settings.footer_text} />
        <input name="github_url" type="url" placeholder="GitHub 링크" defaultValue={settings.github_url} />
        <input name="mastodon_url" type="url" placeholder="Mastodon 링크" defaultValue={settings.mastodon_url} />
        <button className="button primary" type="submit" disabled={saving}>
          {saving ? "저장 중..." : "설정 저장"}
        </button>
      </form>
    </section>
  );
}
