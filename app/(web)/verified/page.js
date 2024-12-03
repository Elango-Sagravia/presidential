"use client"; // This line marks the component as a Client Component

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Verified = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to homepage after 3 seconds
    const timer = setTimeout(() => {
      router.push("/"); // Replace '/' with your homepage route if different
    }, 3000);

    // Cleanup timeout on component unmount
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="bg-nl_sec_background min-h-svh md:min-h-[1050px] flex justify-center items-center px-4 md:px-8">
      <h1 className="text-3xl text-nl_background w-full md:w-1/2">
        Thanks for verifying your email. You will be redirected to the website.
      </h1>
    </div>
  );
};

export default Verified;
