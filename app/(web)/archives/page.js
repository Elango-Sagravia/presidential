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
export const metadata = {
  title: "Presidential Summary Archives - Explore Past Newsletters",
  description:
    "Browse the archives of Presidential Summary to access past newsletters. Stay updated with valuable insights and news analysis.",
  alternates: {
    canonical: "https://www.presidentialsummary.com/archives",
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
