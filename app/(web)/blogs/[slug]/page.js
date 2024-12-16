import BlogInfo from "@/components/ui/blogInfo/blogInfo";
import BlogTitle from "@/components/ui/blogTitle/blogTitle";

import { notFound } from "next/navigation";
import {
  getDocumentBySlug,
  getDocuments,
  getDocumentSlugs,
} from "outstatic/server";
import { remark } from "remark";
import html from "remark-html";

async function getData(params) {
  const post = getDocumentBySlug("articles", params.slug, [
    "title",
    "publishedAt",
    "slug",
    "author",
    "content",
    "coverImage",
    "readTime",
  ]);
  if (!post) {
    notFound();
  }
  console.log("post in slug", post);
  const content = await markdownToHtml(post.content || "");

  return {
    ...post,
    content,
  };
}

export async function markdownToHtml(markdown) {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}
export async function generateStaticParams() {
  const posts = getDocumentSlugs("articles");
  return posts.map((slug) => ({ slug }));
}
const customStyles = {
  h2: "text-3xl font-bold mt-8 mb-4",
  h3: "text-2xl font-bold mt-8 mb-4",
  p: "mb-4",
  img: "max-w-full h-auto",
  a: "text-blue-500 hover:text-blue-700",
  ol: "list-decimal list-inside mb-4",
  ul: "list-disc list-inside mb-4",
  li: "ml-4",
};
export default async function Home({ params }) {
  const blog = await getData(params);
  const styledContent = blog.content
    .replace(/<h2>/g, `<h2 class="${customStyles.h2}">`)
    .replace(/<h3>/g, `<h3 class="${customStyles.h3}">`)
    .replace(/<p>/g, `<p class="${customStyles.p}">`)
    .replace(/<img /g, `<img class="${customStyles.img}" `)
    .replace(/<a /g, `<a target="_blank" class="${customStyles.a}" `)
    .replace(/<ol>/g, `<ol class="${customStyles.ol}">`)
    .replace(/<li>/g, `<li class="${customStyles.li}">`);
  return (
    <>
      <section
        className={`w-full md:w-4/5 lg:w-2/3 px-4 md:px-0 mx-auto pt-16 pb-16 md:pt-32 max-w-7xl `}
      >
        <BlogInfo date={blog.publishedAt} read_time={blog.readTime} />
        <BlogTitle title={blog.title} />
        <div className="mt-10">
          <div dangerouslySetInnerHTML={{ __html: styledContent }}></div>
        </div>
      </section>
    </>
  );
}
