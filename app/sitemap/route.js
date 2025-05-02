export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.url;

  const sitemaps = [
    "sitemap_main.xml",
    "sitemap_blogs.xml",
    "sitemap_policies.xml",
    "sitemap_pages.xml",
    "sitemap_articles.xml",
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (name) => `
  <sitemap>
    <loc>${baseUrl}/${name}</loc>
  </sitemap>`
  )
  .join("")}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Content-Disposition": 'inline; filename="sitemap.xml"',
    },
  });
}
