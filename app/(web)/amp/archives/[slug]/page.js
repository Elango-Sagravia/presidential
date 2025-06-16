export const dynamic = "force-static";

import { getDocumentBySlug, getDocumentSlugs } from "outstatic/server";
import { notFound } from "next/navigation";

function convertToAmpHtml(html) {
  return html
    .replace(/<img(.*?)\/?>/g, (match, attrs) => {
      const src = /src=["']?([^"'\s>]+)["']?/.exec(attrs)?.[1];
      const width = /width=["']?(\d+)["']?/.exec(attrs)?.[1] || "600";
      const height = /height=["']?(\d+)["']?/.exec(attrs)?.[1] || "400";

      if (!src) return ""; // skip if no src found

      return `<amp-img src="${src}" width="${width}" height="${height}" layout="responsive" alt="" />`;
    })
    .replaceAll("<a ", '<a target="_blank" ');
}

export async function generateStaticParams() {
  const slugs = getDocumentSlugs("blogs");
  return slugs.map((slug) => ({ slug }));
}

export default async function AMPBlogPage({ params }) {
  const blog = await getDocumentBySlug("blogs", params.slug, [
    "title",
    "slug",
    "emailHtml",
    "publishedAt",
  ]);

  if (!blog || !blog.emailHtml) notFound();

  const ampHtml = convertToAmpHtml(blog.emailHtml);

  return (
    <main
      style={{
        fontFamily: "serif",
        maxWidth: "600px",
        margin: "auto",
        padding: "24px",
      }}
    >
      <h1 style={{ fontSize: "28px", color: "#4d3060" }}>{blog.title}</h1>
      <p style={{ color: "#888", fontSize: "14px" }}>
        {new Date(blog.publishedAt).toLocaleDateString()}
      </p>
      <div dangerouslySetInnerHTML={{ __html: ampHtml }} />
    </main>
  );
}
