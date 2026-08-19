"use client";

import { useEffect, useState } from "react";

import { getBlogPosts, getSeriesList } from "../lib/api";

export function PostCounter() {
  const [postCount, setPostCount] = useState<number | null>(null);
  const [seriesCount, setSeriesCount] = useState<number | null>(null);

  useEffect(() => {
    getBlogPosts(1, 0)
      .then((data) => setPostCount(data.total))
      .catch(() => setPostCount(null));
    getSeriesList()
      .then((data) => setSeriesCount(data.items.length))
      .catch(() => setSeriesCount(null));
  }, []);

  if (postCount === null) {
    return null;
  }

  return (
    <div className="counter">
      {postCount} posts{seriesCount !== null ? ` · ${seriesCount} series` : ""}
    </div>
  );
}
