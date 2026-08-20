"use client";

import { useEffect, useState } from "react";

import { getSiteSettings } from "../lib/api";
import { footerText as fallbackFooterText, githubUrl as fallbackGithubUrl, mastodonUrl as fallbackMastodonUrl } from "../lib/config";

export function SiteFooter() {
  const [footerText, setFooterText] = useState(fallbackFooterText);
  const [githubUrl, setGithubUrl] = useState(fallbackGithubUrl);
  const [mastodonUrl, setMastodonUrl] = useState(fallbackMastodonUrl);

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        setFooterText(data.footer_text);
        setGithubUrl(data.github_url);
        setMastodonUrl(data.mastodon_url);
      })
      .catch(() => {
        // keep the fallback values on failure
      });
  }, []);

  return (
    <footer>
      <div className="shell footer-row">
        <div>{footerText}</div>
        <div className="footer-links">
          <a href={githubUrl} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={mastodonUrl} target="_blank" rel="noreferrer">
            Mastodon
          </a>
        </div>
      </div>
    </footer>
  );
}
