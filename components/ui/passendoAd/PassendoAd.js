"use client";

import { useEffect } from "react";

export default function PassendoAd() {
  useEffect(() => {
    fetch("https://euir.trckrhst.com/webtag/55680")
      .then((res) => res.text())
      .then((scriptContent) => {
        console.log("Fetched Script:", scriptContent); // ✅ Add this line

        const match = scriptContent.match(/document\.write\("(.*)"\);/s);
        if (match && match[1]) {
          const html = match[1].replace(/\\"/g, '"').replace(/\\n/g, "");

          const container = document.createElement("div");
          container.innerHTML = html;

          const target = document.getElementById("passendo-ad");
          if (target) target.appendChild(container);
        } else {
          console.warn("No document.write match found.");
        }
      });
  }, []);
  return <div className="max-w-[600px] mx-auto py-5" id="passendo-ad"></div>;
}
