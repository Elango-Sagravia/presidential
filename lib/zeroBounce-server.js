import ZeroBounceSDK from "@zerobounce/zero-bounce-sdk";

// Initialize ZeroBounce SDK with your API Key
const zeroBounceServer = new ZeroBounceSDK();
zeroBounceServer.init(process.env.ZEROBOUNCE_API_KEY);

export default zeroBounceServer;
