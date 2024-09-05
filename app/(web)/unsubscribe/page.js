"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

const Unsubscribe = () => {
  const params = useSearchParams();
  const email = params.get("email");

  useEffect(() => {
    try {
      fetch(`https://hooks.zapier.com/hooks/catch/11976044/2t02mgc/`, {
        mode: "no-cors",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          domain: window.location.hostname,
        }),
      });
    } catch (error) {}
  }, []);
  return (
    <Suspense>
      <div className="bg-nl_sec_background min-h-svh md:min-h-[1050px] flex justify-center items-center px-4 md:px-8">
        <h1 className="text-3xl text-nl_background w-full md:w-1/2">
          Your email({email}) has been successfully removed from our subscriber
          list.
        </h1>
      </div>
    </Suspense>
  );
};

export default Unsubscribe;
