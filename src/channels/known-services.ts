export type KnownService = {
  name: string;
  logoUrl: string;
  href: string;
};

// Keyed by lowercase payee address (sync lowercases on write).
const KNOWN_SERVICES: Record<string, KnownService> = {
  "0xca4e835f803cb0b7c428222b3a3b98518d4779fe": {
    name: "OpenRouter",
    logoUrl:
      "https://nsozpsd7nha37y8m.public.blob.vercel-storage.com/origin-favicons/openrouter-mpp-tempo-xyz/1785275572876.png",
    href: "https://mppscan.com/server/055812bef66cb8f110ffdf6ecb94f1e9bdb7704c60645edafc7c48adaf59a9be",
  },
};

export function lookupService(payee: string): KnownService | null {
  return KNOWN_SERVICES[payee.toLowerCase()] ?? null;
}
