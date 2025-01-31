"use client"; // This line marks the component as a Client Component

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "@/context/appContext";

const Verified = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uniqueid = searchParams.get("uniqueid");
  const { setEmail, setMessage } = useAppContext();

  useEffect(() => {
    if (uniqueid) {
      fetch("/api/verified-by-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uniqueid }),
      })
        .then((response) => response.json())
        .then((data) => {
          setEmail(data.email);
          setMessage("successfully subscribed");
        })
        .catch((error) => {
          console.error("Error verifying user:", error);
        });
    }

    // Redirect to homepage after 3 seconds
    const timer = setTimeout(() => {
      router.push("/"); // Replace '/' with your homepage route if different
    }, 3000);

    // Cleanup timeout on component unmount
    return () => clearTimeout(timer);
  }, [router, uniqueid]);

  return (
    <div className="bg-nl_sec_background min-h-svh md:min-h-[1050px] flex justify-center items-center px-4 md:px-8">
      <h1 className="text-3xl text-nl_background w-full md:w-1/2">
        Thanks for verifying your email. You will be redirected to the website.
      </h1>
    </div>
  );
};

export default Verified;
