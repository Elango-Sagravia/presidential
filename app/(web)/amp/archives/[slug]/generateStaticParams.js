import { getDocumentSlugs } from "outstatic/server";

export async function generateStaticParams() {
  const slugs = getDocumentSlugs("blogs");
  return slugs.map((slug) => ({ slug }));
}
