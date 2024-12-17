"use client";
import { useAppContext } from "@/context/appContext";

export default function NewsLetterAd() {
  const { isSubscribed, email, setEmail } = useAppContext();
  return isSubscribed ? <div>{email}</div> : <div>please subscribe to GP</div>;
}
