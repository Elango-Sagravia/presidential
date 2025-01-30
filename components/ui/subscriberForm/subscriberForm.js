"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAppContext } from "@/context/appContext";
import LoadingSpinner from "@/components/ui/loading-spinner";
import zeroBounce from "@/lib/zeroBounce";

function containsDomain(email, domains) {
  return domains.some((domain) => email.includes(domain));
}

const domains = [
  "yahoo.com",
  "ymail.com",
  "aol.com",
  "rocketmail.com",
  "yahoo",
  "att.net",
  "sbcglobal.net",
  "bellsouth.net",
  "flash.net",
  "pacbell.net",
  "nvbell.net",
  "swbell.net",
];

function detectBrowser() {
  let userAgent = navigator.userAgent;

  if (userAgent.includes("Chrome") && !userAgent.includes("Edge")) {
    return "Chrome";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    return "Safari";
  } else if (userAgent.includes("Firefox")) {
    return "Mozilla Firefox";
  } else if (userAgent.includes("Edg")) {
    return "Microsoft Edge";
  } else {
    return "Other Browser";
  }
}

function detectDevice() {
  let userAgent = navigator.userAgent;

  if (userAgent.includes("iPhone") || userAgent.includes("Android")) {
    return "Mobile";
  } else if (userAgent.includes("iPad")) {
    return "Tablet";
  } else {
    return "Desktop";
  }
}
function detectPlatform() {
  let platform = navigator.platform;

  if (platform.includes("Win")) {
    return "Windows";
  } else if (platform.includes("Mac")) {
    return "MacOS";
  } else if (platform.includes("Linux")) {
    return "Android";
  } else if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    return "iOS";
  } else if (/Android/.test(navigator.userAgent)) {
    return "Android";
  } else {
    return "Other Platform";
  }
}
function SubscriberForm({ formClasses }) {
  const { setEmail, setMessage, setTempEmail } = useAppContext();
  const [inputEmail, setInputEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const formattedEmail = encodeURIComponent(inputEmail.toLowerCase().trim());

    try {
      setLoading(true);
      setLoadingText("Validating...");
      const responseZB = await zeroBounce.validateEmail(
        inputEmail.toLowerCase().trim()
      );

      const response = await fetch(
        `/api/add-user?email=${formattedEmail}&browser=${detectBrowser()}&device=${detectDevice()}&platform=${detectPlatform()}&referrer=${
          document.referrer
        }&zbStatus=${responseZB.status}&zbSubStatus=${responseZB.sub_status}`,
        {
          method: "GET",
        }
      );

      // Read JSON response only once
      const addUserResponse = await response.json();

      if (responseZB.status === "valid" && addUserResponse.success) {
        fetch(`/api/emails/welcome`, {
          mode: "no-cors",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: inputEmail.toLowerCase().trim(),
            uniqueId: addUserResponse.uniqueId,
          }),
        });
      }

      // Use the already parsed JSON response instead of calling .json() again
      if (
        response.ok &&
        (responseZB.status === "valid" || responseZB.status === "catch-all")
      ) {
        setEmail(inputEmail.toLowerCase().trim());
        setMessage("successfully subscribed");
      } else if (responseZB.status !== "valid") {
        setMessage("invalid email");
        setTempEmail(inputEmail.toLowerCase().trim());
      } else {
        setMessage(addUserResponse.error?.message || "Something went wrong.");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again later.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={formClasses} onSubmit={handleSubmit}>
      <div className="flex w-full gap-2">
        <Input
          className="focus:outline-none focus-visible:ring-0 placeholder:text-gray-400 rounded-none"
          type="email"
          placeholder="Enter your email"
          value={inputEmail}
          disabled={loading}
          onChange={(e) => setInputEmail(e.target.value)}
          required={true}
        />
        <Button className="rounded-none">
          {loading ? (
            loadingText.length > 0 ? (
              loadingText
            ) : (
              <LoadingSpinner />
            )
          ) : (
            "Subscribe"
          )}
        </Button>
      </div>
      <p className="text-[12px]">100% free. No spam. Unsubscribe anytime.</p>
    </form>
  );
}

export default SubscriberForm;
