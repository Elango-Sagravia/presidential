import BlogHeader from "@/components/ui/blogHeader/blogHeader";
import Link from "next/link";
import { getDocuments } from "outstatic/server";

async function getData() {
  const blogs = getDocuments("articles", [
    "title",
    "publishedAt",
    "slug",
    "author",
    "content",
    "coverImage",
    "description",
  ]);

  return blogs;
}
function truncateDescription(description, slug) {
  const words = description.split(" ");
  if (words.length > 40) {
    const truncated = words.slice(0, 40).join(" ");
    return (
      <>
        {truncated}...{" "}
        <Link href={`/blogs/${slug}`} className="text-blue-500 underline">
          read more
        </Link>
      </>
    );
  }
  return (
    <>
      {description}{" "}
      <Link href={`/blogs/${slug}`} className="text-blue-500 underline">
        read more
      </Link>
    </>
  );
}
export default async function blogs() {
  const blogs = await getData();
  return (
    <main className="min-h-[71%]">
      <BlogHeader />
      <section className="px-4 md:px-16 pt-4 pb-32 max-w-7xl mx-auto mt-8">
        {blogs.map((blog, index) => (
          <div key={index} className="flex flex-col md:flex-row mb-8">
            <div className="md:basis-1/3">
              <Link href={`/blogs/${blog.slug}`}>
                <img src={blog.coverImage} width="100%"></img>
              </Link>
            </div>
            <div className="md:basis-1/2 md:pl-8">
              <h2 className="text:2xl md:text-3xl text-nl_background font-bold mt-2 md:mt-0">
                {blog.title}
              </h2>
              <p className="text-sm md:text-md mt-2">
                {truncateDescription(blog.description, blog.slug)}
              </p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}