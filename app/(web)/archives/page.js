import ArchiveHeader from "@/components/ui/archiveHeader/archiveHeader";
import GridContainer from "@/components/ui/gridContainer/gridContainer";
import Subscribe from "@/components/ui/subscribe/subscribe";
import blogs from "@/blogs";

import { getDocuments } from "outstatic/server";

async function getData() {
  const blogs = getDocuments("blogs", [
    "title",
    "publishedAt",
    "slug",
    "author",
    "content",
    "coverImage",
    "readTime",
  ]);

  return blogs;
}
const title = "Presidential Summary Archives - Past Editions";
const description =
  "Browse the archives of Presidential Summary and revisit past news briefings. Access previous editions with key news and analysis.";
export const metadata = {
  title,
  description,
  alternates: {
    canonical: "https://www.presidentialsummary.com/archives",
  },
  openGraph: {
    title,
    description,
  },
};
export default async function archive() {
  const blogs = await getData();
  return (
    <main className="">
      <ArchiveHeader />
      <section className="px-4 md:px-16 pt-4 pb-32 max-w-7xl mx-auto">
        <GridContainer hideButton={true} articles={blogs} />
      </section>
      <Subscribe />
    </main>
  );
}
