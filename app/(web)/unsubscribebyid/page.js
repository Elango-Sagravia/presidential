"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

const UnsubscribeContent = () => {
  const params = useSearchParams();
  const uniqueId = params.get("unique_id"); // Assuming user_id is also part of the query parameters
  const campaignId = params.get("campaign_id"); // Assuming campaign_id is part of the query parameters

  useEffect(() => {
    if (uniqueId && campaignId) {
      // Call the unsubscribe GET function
      const unsubscribeUrl = `https://${window.location.hostname}/api/emails/unsubscribebyid?unique_id=${uniqueId}&campaign_id=${campaignId}`;
      try {
        fetch(unsubscribeUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Unsubscribe result:", data);
          })
          .catch((error) => {
            console.error("Error during unsubscribe:", error);
          });
      } catch (error) {
        console.error("Error:", error);
      }
    }
  }, [uniqueId, campaignId]);

  return (
    <h1 className="text-3xl text-nl_background w-full md:w-1/2">
      Your email has been successfully removed from our subscriber list.
    </h1>
  );
};

const Unsubscribe = () => {
  return (
    <div className="bg-nl_sec_background min-h-svh md:min-h-[1050px] flex justify-center items-center px-4 md:px-8">
      <Suspense fallback={<div>Loading...</div>}>
        <UnsubscribeContent />
      </Suspense>
    </div>
  );
};

export default Unsubscribe;
