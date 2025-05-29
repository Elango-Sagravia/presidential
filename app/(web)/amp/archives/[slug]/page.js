import { getDocumentBySlug } from "outstatic/server";
import { remark } from "remark";
import html from "remark-html";

export const dynamic = "error"; // Static generation only

export async function generateMetadata({ params }) {
  const post = await getDocumentBySlug("blogs", params.slug, [
    "title",
    "metaTitle",
    "metaDescription",
    "slug",
  ]);

  return {
    title: post?.metaTitle || post?.title,
    description: post?.metaDescription,
    alternates: {
      canonical: `https://www.presidentialsummary.com/archives/${params.slug}`,
    },
  };
}

export default async function AMPBlogPage({ params }) {
  const post = await getDocumentBySlug("blogs", params.slug, [
    "title",
    "content",
    "coverImage",
    "slug",
    "emailHtml",
  ]);

  const result = await remark()
    .use(html)
    .process(post.emailHtml || "");
  const htmlContent = result.toString();

  console.log("emailHtml", post);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
      {post.coverImage && (
        <amp-img
          src={post.coverImage}
          width="600"
          height="400"
          layout="responsive"
          alt={post.title}
        ></amp-img>
      )}
      <article
        className="prose"
        dangerouslySetInnerHTML={{ __html: post.emailHtml }}
      />
    </main>
  );
}
