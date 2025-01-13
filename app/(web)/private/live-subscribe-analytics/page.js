import dynamic from "next/dynamic";

const LiveStats = dynamic(() => import("./SubscriberStats"), { ssr: false });

export default LiveStats;

// export default async function LiveStats() {
//   return <SubscriberStats />;
// }
