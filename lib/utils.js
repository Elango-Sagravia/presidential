import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function detectBrowser() {
  let userAgent = navigator.userAgent;

  if (userAgent.includes("Chrome") && !userAgent.includes("Edge")) {
    return "Chrome";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    return "Safari";
  } else if (userAgent.includes("Firefox")) {
    return "Mozilla Firefox";
  } else if (userAgent.includes("Edg")) {
    return "Microsoft Edge";
  } else {
    return "Other Browser";
  }
}

export function detectDevice() {
  let userAgent = navigator.userAgent;

  if (userAgent.includes("iPhone") || userAgent.includes("Android")) {
    return "Mobile";
  } else if (userAgent.includes("iPad")) {
    return "Tablet";
  } else {
    return "Desktop";
  }
}
export function detectPlatform() {
  let platform = navigator.platform;

  if (platform.includes("Win")) {
    return "Windows";
  } else if (platform.includes("Mac")) {
    return "MacOS";
  } else if (platform.includes("Linux")) {
    return "Android";
  } else if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    return "iOS";
  } else if (/Android/.test(navigator.userAgent)) {
    return "Android";
  } else {
    return "Other Platform";
  }
}