import libre from "@/components/libre-font";

export default function BlogHeader() {
  return (
    <div className="">
      <div
        className={`px-4 md:px-16 lg:pt-44 pt-40 ${libre.className} leading-tight max-w-7xl mx-auto`}
      >
        <h1 className="text-4xl text-nl_background">Articles</h1>
      </div>
    </div>
  );
}
