"use client";

import { useEffect, useState } from "react";

import { getAssetUrl } from "../lib/api";

export function AuthorizedImage({
  assetId,
  alt,
  demoEmail,
  className
}: {
  assetId: number;
  alt: string;
  demoEmail?: string;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(getAssetUrl(assetId), {
          credentials: "include",
          cache: "no-store",
          headers: demoEmail ? { "x-demo-user": demoEmail } : undefined
        });

        if (!response.ok) {
          throw new Error(`Failed to load asset ${assetId}`);
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) {
          setSrc(objectUrl);
        }
      } catch {
        if (!cancelled) {
          setFailed(true);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [assetId, demoEmail]);

  if (failed) {
    return <p className="empty-state">이미지를 불러올 수 없습니다.</p>;
  }

  if (!src) {
    return <p className="empty-state">이미지 불러오는 중...</p>;
  }

  return <img className={className} src={src} alt={alt} />;
}
