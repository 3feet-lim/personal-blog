"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getSiteSettings } from "../lib/api";
import { appName as fallbackAppName, siteSubtitle as fallbackSiteSubtitle } from "../lib/config";

export function SiteBrand() {
  const [name, setName] = useState(fallbackAppName);
  const [subtitle, setSubtitle] = useState(fallbackSiteSubtitle);

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        setName(data.site_name);
        setSubtitle(data.site_subtitle);
        // The app is a static export, so layout.tsx's metadata.title is baked
        // in at build time and would keep showing the old name after an admin
        // rename. Sync the live name into the tab title so it stays consistent
        // with the header without needing a rebuild.
        document.title = data.site_name;
      })
      .catch(() => {
        // keep the fallback values on failure
      });
  }, []);

  return (
    <div>
      <Link className="brand" href="/">
        {name}
      </Link>
      <div className="brand-subtitle">{subtitle}</div>
    </div>
  );
}
