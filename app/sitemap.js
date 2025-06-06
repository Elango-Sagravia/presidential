import { getDocumentSlugs, getDocuments } from "outstatic/server";

export default function sitemap() {
  const mainPages = ["", "advertise", "archives", "contact"];
  const mainPagesUrl = mainPages.map((slug) => ({
    url: `${process.env.url}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  }));
  const posts = getDocuments("blogs", ["slug"]);
  const postUrls = posts
    .filter((el) => el.status === "published")
    .map((slug) => ({
      url: `${process.env.url}/archives/${slug.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    }));

  const policies = getDocuments("policies", ["slug"]);
  const policiesUrl = policies
    .filter((el) => el.status === "published")
    .map((slug) => ({
      url: `${process.env.url}/policy/${slug.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    }));

  const pages = getDocuments("pages", ["slug"]);
  const pagesUrl = pages
    .filter((el) => el.status === "published")
    .map((slug) => ({
      url: `${process.env.url}/general/${slug.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    }));

  const articles = getDocuments("articles", ["slug"]);
  const articlesUrl = articles
    .filter((el) => el.status === "published")
    .map((slug) => ({
      url: `${process.env.url}/articles/${slug.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    }));

  return [
    ...mainPagesUrl,
    ...postUrls,
    ...pagesUrl,
    ...policiesUrl,
    ...articlesUrl,
  ];
}
