"use client";

import { useAppContext } from "@/context/appContext";
import { detectBrowser, detectDevice, detectPlatform } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function NewsLetterAd() {
  const { isSubscribed, email } = useAppContext(); // Accessing email directly from AppContext
  const [userSubscribed, setUserSubscribed] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setUserSubscribed(true);
    }
  }, []);

  async function handleSubscribe(e) {
    e.preventDefault();

    if (!email) {
      alert("Email is missing. Please provide an email to subscribe.");
      return;
    }

    try {
      const response = await fetch(
        `https://www.geopoliticalsummary.com/api/add-user?email=${formattedEmail}&browser=${detectBrowser()}&device=${detectDevice()}&platform=${detectPlatform()}&referrer=${
          document.referrer
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(email),
        }
      );

      if (response.ok) {
        localStorage.setItem("userEmail", email);
        setUserSubscribed(true);
        alert("Subscription successful! Thank you.");
      } else {
        const errorMessage = await response.json();
        alert(`Subscription failed: ${errorMessage.message}`);
      }
    } catch (error) {
      console.error("Error during subscription:", error);
      alert("An error occurred. Please try again.");
    }
  }
  return (
    <div>
      {!isSubscribed ? (
        <div className="mb-4">
          <div className=" flex ">
            <div className="flex-1 bg-[#06276f] px-8 md:px-16 py-20 lg:py-10 max-w-7xl mx-auto lg:min-h-[450px]">
              <div>
                <Image
                  src="/gp-logo-dark.png"
                  width={100}
                  height={100}
                  alt="Geopolitics logo"
                />
              </div>
              <h1 className="text-4xl sm:text-5xl text-white mt-4 mb-10 leading-tight sm:leading-tight">
                Fact-checked geopolitics news that diplomats read
              </h1>
              <a
                href="https://www.geopolitics.world/"
                className="mt-4 text-2xl w-full md:w-3/4 text-white underline text-left"
              >
                Visit &rarr;
              </a>
            </div>

            <div className="hidden bg-white flex-1 lg:block relative">
              <Image
                src="/gp-home-hero.jpg"
                fill
                objectFit="cover"
                alt="Home screen banner image"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex ">
            <div className="flex-1 bg-[#06276f] px-8 md:px-16 py-20 lg:py-10 max-w-7xl mx-auto lg:min-h-[450px]">
              <div>
                <Image
                  src="/gp-logo-dark.png"
                  width={100}
                  height={100}
                  alt="Geopolitics logo"
                />
              </div>
              <h1 className="text-4xl sm:text-5xl text-white mt-4 mb-10 leading-tight sm:leading-tight">
                Fact-checked geopolitics news that diplomats read
              </h1>
              <button
                onClick={handleSubscribe}
                className="bg-black p-2 mt-4 text-xl w-full md:w-3/6 text-white text-center rounded-lg"
              >
                Subscribe to Geopolitics
              </button>

            </div>

            <div className="hidden flex-1 lg:block relative">
              <Image
                src="/gp-home-hero.jpg"
                fill
                objectFit="cover"
                alt="Home screen banner image"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
