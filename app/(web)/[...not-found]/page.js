"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CatchAllRedirect() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push("/");
    }, 3000); // Redirects after 3 seconds
  }, []);

  return (
    <div className="min-h-screen flex justify-center items-center bg-nl_sec_background">
      <div className="text-center">
        <h1 className="text-2xl">404 - Page Not Found</h1>
        <p className="mt-4">
          Sorry, the page you are looking for does not exist.
        </p>
        <p className="mt-4">Redirecting to homepage....</p>
      </div>
    </div>
  );
}
