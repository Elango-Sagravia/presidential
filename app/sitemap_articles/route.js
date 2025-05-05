import { getDocumentSlugs } from "outstatic/server";

export async function GET() {
  const baseUrl = process.env.url;
  const slugs = await getDocumentSlugs("articles");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${slugs
  .map(
    (slug) => `
  <url>
    <loc>${baseUrl}/articles/${slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join("")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Content-Disposition": 'inline; filename="sitemap_articles.xml"',
    },
  });
}
