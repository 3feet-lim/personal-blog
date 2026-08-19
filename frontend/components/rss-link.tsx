"use client";

import { getRssUrl } from "../lib/api";

export function RssLink() {
  return <a href={getRssUrl()}>RSS</a>;
}
