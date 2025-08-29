import { WhopServerSdk } from "@whop/api";

// Lazy initialization function
let _whopSdk: ReturnType<typeof WhopServerSdk> | null = null;

export const getWhopSdk = () => {
  // Only initialize if we're in a Whop environment (not localhost development)
  const isWhopEnvironment = process.env.NEXT_PUBLIC_WHOP_APP_ID && 
                           process.env.WHOP_API_KEY &&
                           process.env.NEXT_PUBLIC_WHOP_APP_ID !== "fallback" &&
                           process.env.WHOP_API_KEY !== "fallback";

  if (!_whopSdk && isWhopEnvironment) {
    _whopSdk = WhopServerSdk({
      appId: process.env.NEXT_PUBLIC_WHOP_APP_ID ?? "fallback",
      appApiKey: process.env.WHOP_API_KEY ?? "fallback",
      onBehalfOfUserId: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
      companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
    });
  }

  return _whopSdk;
};

// For backward compatibility, but with a warning
export const whopSdk = {
  get users() {
    const sdk = getWhopSdk();
    if (!sdk) {
      throw new Error("Whop SDK not available. This feature only works in Whop environment.");
    }
    return sdk.users;
  },
  get access() {
    const sdk = getWhopSdk();
    if (!sdk) {
      throw new Error("Whop SDK not available. This feature only works in Whop environment.");
    }
    return sdk.access;
  },
  get payments() {
    const sdk = getWhopSdk();
    if (!sdk) {
      throw new Error("Whop SDK not available. This feature only works in Whop environment.");
    }
    return sdk.payments;
  },
  get messages() {
    const sdk = getWhopSdk();
    if (!sdk) {
      throw new Error("Whop SDK not available. This feature only works in Whop environment.");
    }
    return sdk.messages;
  }
};