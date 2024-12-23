"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAppContext } from "@/context/appContext";
import LoadingSpinner from "@/components/ui/loading-spinner";

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
  const { setEmail, setMessage } = useAppContext();
  const [inputEmail, setInputEmail] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    const formattedEmail = encodeURIComponent(inputEmail.toLowerCase().trim());

    try {
      setLoading(true);
      const response = await fetch(
        `/api/add-user?email=${formattedEmail}&browser=${detectBrowser()}&device=${detectDevice()}&platform=${detectPlatform()}&referrer=${
          document.referrer
        }`,
        {
          method: "GET",
        }
      );
      fetch(`/api/emails/verify?email=${formattedEmail}`);
      fetch(`/api/emails/welcome`, {
        mode: "no-cors",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inputEmail.toLowerCase().trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmail(inputEmail.toLowerCase().trim());

        setMessage("Successfully subscribed!");
      } else {
        setMessage(data.error.message || "Something went wrong.");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again later.");
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
          {loading ? <LoadingSpinner /> : "Subscribe"}
        </Button>
      </div>
      <p className="text-[12px]">100% free. No spam. Unsubscribe anytime.</p>
    </form>
  );
}

export default SubscriberForm;
