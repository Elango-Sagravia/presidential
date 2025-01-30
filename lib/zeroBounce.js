import ZeroBounceSDK from "@zerobounce/zero-bounce-sdk";

// Initialize ZeroBounce SDK with your API Key
const zeroBounce = new ZeroBounceSDK();
zeroBounce.init(process.env.NEXT_PUBLIC_ZEROBOUNCE_API_KEY);

export default zeroBounce;
