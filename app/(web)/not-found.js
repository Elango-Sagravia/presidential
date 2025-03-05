import Link from "next/link";

// export const metadata = {
//   robots: "noindex, nofollow",
// };

export default function NotFound() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-nl_sec_background">
      <div className="text-center">
        <h1 className="text-2xl">404 - Page Not Found</h1>
        <p className="mt-4">
          Sorry, the page you are looking for does not exist.
        </p>
        <Link className="block mt-5 text-nl_background" href={"/"}>
          Visit Home
        </Link>
      </div>
    </div>
  );
}
