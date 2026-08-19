"use client";

import { usePathname } from "next/navigation";

import { ModeToggle } from "./mode-toggle";

export function ModeToggleSlot() {
  const pathname = usePathname();
  const current = pathname?.startsWith("/family") ? "family" : "tech";

  return <ModeToggle current={current} />;
}
