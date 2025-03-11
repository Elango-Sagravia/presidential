"use client"; // Marks the component as a Client Component

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "@/context/appContext";

const Verified = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uniqueid = searchParams.get("uniqueid");
  const email_uniqueid = searchParams.get("email_uniqueid");
  const { setEmail, setMessage } = useAppContext();

  // State to track verification message
  const [verificationMessage, setVerificationMessage] = useState("");

  useEffect(() => {
    if (uniqueid && email_uniqueid) {
      // Scenario 2: Verify email in emails_list
      fetch("/api/emails/emails_list_verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_uniqueid: uniqueid, email_uniqueid }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Email verified successfully") {
            setEmail(data.email);
            setVerificationMessage("Email verified successfully.");
            setMessage("successfully subscribed");
          } else if (
            data.message === "Email already verified or does not exist"
          ) {
            setVerificationMessage(
              "Email is already verified or does not exist."
            );
          } else {
            setVerificationMessage("Verification failed. Please try again.");
          }
        })
        .catch((error) => {
          console.error("Error verifying email:", error);
          setVerificationMessage("Verification failed due to a server error.");
        });
    } else if (uniqueid) {
      // Scenario 1: Verify user
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
          setVerificationMessage("Successfully subscribed.");
          setMessage("successfully subscribed");
        })
        .catch((error) => {
          console.error("Error verifying user:", error);
          setVerificationMessage("Verification failed due to a server error.");
        });
    }

    // Redirect to homepage after 3 seconds
    const timer = setTimeout(() => {
      router.push("/"); // Replace '/' with your homepage route if different
    }, 3000);

    // Cleanup timeout on component unmount
    return () => clearTimeout(timer);
  }, [router, uniqueid, email_uniqueid]);

  return (
    <div className="bg-nl_sec_background min-h-svh md:min-h-[1050px] flex justify-center items-center px-4 md:px-8">
      <h1 className="text-3xl text-nl_background w-full md:w-1/2 text-center">
        {`${verificationMessage} You will be redirected to the website.`}
      </h1>
    </div>
  );
};

export default Verified;
