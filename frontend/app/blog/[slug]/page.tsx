import { notFound } from "next/navigation";
import { getBlogPost } from "../../../lib/api";

export const dynamic = "force-dynamic";

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="panel detail-card">
      <div className="eyebrow">Markdown Source</div>
      <h1>{post.title}</h1>
      <p>{post.summary}</p>
      <pre>{post.content}</pre>
    </article>
  );
}
