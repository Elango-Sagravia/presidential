import { notFound } from "next/navigation";

export default function CatchAllNotFound() {
  notFound(); // This will trigger `not-found.js` inside (web)
}
