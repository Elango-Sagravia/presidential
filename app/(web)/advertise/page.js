import AdvertiseForm from "@/components/ui/advertiseForm/advertiseForm";
import AdvertiseHero from "@/components/ui/advertiseHero/advertiseHero";
import AdvertiseQuestion from "@/components/ui/advertiseQuestion/advertiseQuestion";
import AdvertiseStatus from "@/components/ui/advertiseStatus/advertiseStatus";

const title = "Advertise with Presidential Summary";
const description =
  "Promote your brand to an engaged, US-based audience through Presidential Summary newsletter. Reach decision-makers with clear, native advertisements.";
export const metadata = {
  title,
  description,
  alternates: {
    canonical: "https://www.presidentialsummary.com/advertise",
  },
  openGraph: {
    title,
    description,
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
