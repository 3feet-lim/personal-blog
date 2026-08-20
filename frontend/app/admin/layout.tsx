"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/albums", label: "Albums" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/settings", label: "Settings" }
];

const VIEW_LINKS = [
  { href: "/blog", label: "Blog View" },
  { href: "/album", label: "Album View" }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin" || pathname === "/admin/";
    }
    return pathname === href || pathname === `${href}/`;
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="eyebrow">Admin</div>
        {ADMIN_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={isActive(link.href) ? "active" : undefined}>
            {link.label}
          </Link>
        ))}
        {VIEW_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={isActive(link.href) ? "active" : undefined}>
            {link.label}
          </Link>
        ))}
      </aside>
      <div>{children}</div>
    </div>
  );
}
