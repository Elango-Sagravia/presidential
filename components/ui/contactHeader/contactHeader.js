import PrimaryInterLinkButton from "../PrimaryInterLinkButton/PrimaryInterLinkButton";
import { ArrowDown } from "lucide-react";
import libre from "@/components/libre-font";
import Image from "next/image";
import content from "@/content/content";
import { cn } from "@/lib/utils";

export default function ContactHeader() {
  return (
    <div>
      <div className="flex px-4 md:px-16 pt-40 pb-24 lg:pt-44 lg:min-h-[550px] max-w-7xl mx-auto">
        <div className="flex-1">
          <h1
            className={`${cn(
              `text-nl_background text-4xl sm:text-5xl ${libre.className} leading-tight sm:leading-tight`
            )}`}
          >
            Contact us
          </h1>
        </div>
        <div className="hidden flex-1 lg:block relative">
          <Image
            src={"/contact.jpg"}
            layout="fill"
            objectFit="cover"
            alt="Home screen banner image"
          />
        </div>
      </div>
    </div>
  );
}
