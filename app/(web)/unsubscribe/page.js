"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

const UnsubscribeContent = () => {
  const params = useSearchParams();
  const uniqueid = params.get("uniqueid");
  const email_uniqueid = params.get("email_uniqueid");

  // State to store the unsubscribe message
  const [unsubscribeMessage, setUnsubscribeMessage] = useState(
    "Processing your request..."
  );

  useEffect(() => {
    if (uniqueid && email_uniqueid) {
      // Call the unsubscribe POST API
      fetch("/api/emails/emails_list_unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_uniqueid: uniqueid, email_uniqueid }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Email unsubscribed successfully") {
            setUnsubscribeMessage(
              `Your email (${data.email}) has been successfully unsubscribed.`
            );
          } else if (
            data.message === "Email already unsubscribed or does not exist"
          ) {
            setUnsubscribeMessage(
              "Email is already unsubscribed or does not exist."
            );
          } else {
            setUnsubscribeMessage("Unsubscription failed. Please try again.");
          }
        })
        .catch((error) => {
          console.log(error);
          console.error("Error during unsubscribe:", error);
          setUnsubscribeMessage("Unsubscription failed due to a server error.");
        });
    } else {
      setUnsubscribeMessage("Missing required parameters.");
    }
  }, [uniqueid, email_uniqueid]);

  return (
    <h1 className="text-3xl text-nl_background w-full md:w-1/2 text-center">
      {unsubscribeMessage}
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
