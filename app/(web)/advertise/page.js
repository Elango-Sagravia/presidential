import AdvertiseForm from "@/components/ui/advertiseForm/advertiseForm";
import AdvertiseHero from "@/components/ui/advertiseHero/advertiseHero";
import AdvertiseQuestion from "@/components/ui/advertiseQuestion/advertiseQuestion";
import AdvertiseStatus from "@/components/ui/advertiseStatus/advertiseStatus";

export const metadata = {
  title: "Advertise with Presidential Summary - Reach a Targeted Audience",
  description:
    "Promote your brand and gain customers the same day with Presidential Summary newsletters. Reach engaged US audience with native newsletter advertisements.",
  alternates: {
    canonical: "https://www.presidentialsummary.com/advertise",
  },
};
export default function Advertise() {
  return (
    <main>
      <AdvertiseHero />
      <AdvertiseStatus />
      <AdvertiseForm />
      <AdvertiseQuestion />
    </main>
  );
}
