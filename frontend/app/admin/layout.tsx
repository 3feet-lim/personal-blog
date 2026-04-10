import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="panel sidebar">
        <div className="eyebrow">Admin</div>
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/blog">Blog</Link>
        <Link href="/admin/albums">Albums</Link>
        <Link href="/admin/users">Users</Link>
        <Link href="/blog">Blog View</Link>
        <Link href="/album">Album View</Link>
      </aside>
      <div>{children}</div>
    </div>
  );
}
