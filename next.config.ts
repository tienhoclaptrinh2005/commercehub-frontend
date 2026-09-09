import type { NextConfig } from "next";

function getMediaRemotePattern(): URL | null {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.trim();
  if (!configuredBaseUrl) return null;

  const parsed = new URL(configuredBaseUrl);
  if (parsed.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_MEDIA_BASE_URL must use HTTPS");
  }
  parsed.pathname = `${parsed.pathname.replace(/\/$/, "")}/**`;
  parsed.search = "";
  return parsed;
}

const mediaRemotePattern = getMediaRemotePattern();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://vietqr.app/img/**"),
      ...(mediaRemotePattern ? [mediaRemotePattern] : []),
    ],
  },
};

export default nextConfig;
