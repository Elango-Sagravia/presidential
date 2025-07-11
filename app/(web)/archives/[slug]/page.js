import SingleBlog from "@/components/ui/singleBlog/singleBlog";
import { notFound, redirect } from "next/navigation";
import {
  getDocumentBySlug,
  getDocuments,
  getDocumentSlugs,
} from "outstatic/server";
import { remark } from "remark";
import html from "remark-html";
import { Suspense } from "react";

async function getData(params) {
  const post = getDocumentBySlug("blogs", params.slug, [
    "title",
    "publishedAt",
    "slug",
    "author",
    "content",
    "coverImage",
    "readTime",
    "cutOff",
    "relatedArticles",
    "footerBannerTitle",
    "footerBannerContent",
    "emailHtml",
    "emailHtmlPreview",
  ]);
  if (!post) {
    notFound();
  }
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
  const posts = getDocumentSlugs("blogs");
  return posts.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = params;

  // Fetch metadata for the slug
  const post = await getDocumentBySlug("blogs", params.slug, [
    "slug",
    "metaTitle",
    "metaDescription",
    "coverImage",
  ]);
  // Define canonical overrides
  const canonicalOverrides = {
    "swipe-left-on-trans-rights":
      "trump-and-musk-s-comment-and-trudeau-steps-down",
    "uganda-s-jab-at-ebola": "swipe-left-on-trans-rights",
    "power-transfer-tibet-earthquakes-charlie-hebdo-anniversary":
      "noble-nominee-again",
    "black-box-and-blame-game": "noble-nominee-again",
    "getting-trumped": "swipe-left-on-trans-rights",
  };

  // Determine the correct canonical URL
  const canonicalSlug = canonicalOverrides[slug] || slug;

  return {
    metadataBase: new URL(process.env.url),
    title: post?.metaTitle,
    description: post?.metaDescription,
    alternates: {
      canonical: `https://www.presidentialsummary.com/archives/${canonicalSlug}`,
    },
    themeColor: "#4c305f",
    openGraph: {
      title: post?.metaTitle,
      description: post?.metaDescription,
      url: process.env.url,
      images: [
        {
          url: post?.coverImage,
          secureUrl: post?.coverImage,
          alt: "Presidential Summary",
        },
      ],
      type: "article",
    },
  };
}
export default async function Home({ params }) {
  const blog = await getData(params);

  const blogs = await getDocuments("blogs", [
    "title",
    "slug",
    "coverImage",
    "readTime",
  ]);
  const index = blogs.findIndex((blog) => blog.slug === params.slug);
  const relatedBlogsSlugs = blog.relatedArticles.split(",");
  const relatedArticles = blogs.filter((el) =>
    relatedBlogsSlugs.includes(el.slug)
  );
  console.log(blog);
  return (
    <div className="archive-page-slug">
      <Suspense>
        <SingleBlog
          index={index}
          blog={blog}
          relatedArticles={relatedArticles}
        />
      </Suspense>
    </div>
  );
}
