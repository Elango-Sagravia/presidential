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
    return "Linux";
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
    const formattedEmail = inputEmail.toLowerCase().trim();

    try {
      setLoading(true);
      setLoadingText("Validating...");
      const responseZeroBounce = await fetch(`/api/zero-bounce`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formattedEmail }),
      });

      const responseZB = await responseZeroBounce.json();

      const response = await fetch(`/api/add-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formattedEmail,
          browser: detectBrowser(),
          device: detectDevice(),
          platform: detectPlatform(),
          referrer: document.referrer,
          zbStatus: responseZB.status,
          zbSubStatus: responseZB.sub_status,
          city: responseZB.city,
          country: responseZB.country,
          domain: responseZB.domain,
          firstname: responseZB.firstname,
          lastname: responseZB.lastname,
          gender: responseZB.gender,
          zipcode: responseZB.zipcode,
          region: responseZB.region,
          smtp_provider: responseZB.smtp_provider,
        }),
      });

      const addUserResponse = await response.json();

      if (responseZB.status === "valid" && addUserResponse.success) {
        await fetch(`/api/emails/welcome`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formattedEmail,
            uniqueId: addUserResponse.uniqueId,
          }),
        });
      }

      if (
        response.ok &&
        (responseZB.status === "valid" || responseZB.status === "catch-all")
      ) {
        setEmail(formattedEmail);
        setMessage("successfully subscribed");
      } else if (responseZB.status !== "valid") {
        setMessage("invalid email");
        setTempEmail(formattedEmail);
      } else {
        setMessage(addUserResponse.error?.message || "Something went wrong.");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again later.");
      console.error(error);
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
