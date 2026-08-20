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
