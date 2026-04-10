import { notFound } from "next/navigation";
import { MarkdownContent } from "../../../components/markdown-content";
import { getBlogPost } from "../../../lib/api";

export const dynamic = "force-dynamic";

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="panel detail-card">
      <div className="eyebrow">Markdown Rendered</div>
      <h1>{post.title}</h1>
      <p>{post.summary}</p>
      <MarkdownContent source={post.content} />
    </article>
  );
}
