import Image from "next/image";
import { Button } from "@/components/ui/button";
import Hero from "@/components/ui/hero/Hero";
import Latest from "@/components/ui/latest/latest";
import ArchiveHome from "@/components/ui/archiveHome/archiveHome";
import Subscribe from "@/components/ui/subscribe/subscribe";
import { PassThrough } from "nodemailer/lib/xoauth2";
import PassendoAd from "@/components/ui/passendoAd/PassendoAd";

export const metadata = {
  title: "Presidential Summary - Stay informed, widen your worldview",
  description:
    "Get the most important global news and analysis every morning with Presidential Summary. Quick, clear, and trusted updates delivered to your inbox.",
  alternates: {
    canonical: "https://www.presidentialsummary.com/",
  },
};

export default function Home() {
  return (
    <main>
      <Hero />
      <Latest />
      <ArchiveHome />
      <Subscribe />
      {/* <PassendoAd /> */}
    </main>
  );
}
