import Verified from "@/components/ui/verified/verified";
import { Suspense } from "react";

export default async function Home({ params }) {
  return (
    <div>
      <Suspense>
        <Verified />
      </Suspense>
    </div>
  );
}
