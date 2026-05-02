import type { NextConfig } from "next";

/** Allow same-origin `/api` + `/uploads` proxy when env points at loopback or is unset (phone-on-LAN dev). */
function useLocalApiRewrites(): boolean {
  const raw = (process.env.NEXT_PUBLIC_API_ORIGIN || "").trim();
  if (!raw) return true;
  try {
    const u = new URL(raw.includes("://") ? raw : `http://${raw}`);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

/** Vercel + split API: allow `next/image` for `/uploads` served from `NEXT_PUBLIC_API_ORIGIN`. */
function apiOriginImagePattern(): { protocol: "http" | "https"; hostname: string } | null {
  const raw = (process.env.NEXT_PUBLIC_API_ORIGIN || "").trim();
  if (!raw) return null;
  try {
    const u = new URL(raw.includes("://") ? raw : `https://${raw}`);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return null;
    const protocol = u.protocol === "https:" ? "https" : "http";
    return { protocol, hostname: u.hostname };
  } catch {
    return null;
  }
}

const apiHostPattern = apiOriginImagePattern();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      ...(apiHostPattern ? [apiHostPattern] : []),
    ],
  },
  turbopack: {
    root: __dirname,
    resolveAlias: {
      "react-router-dom": "./src/lib/routerShim.tsx",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-router-dom": require("path").resolve(__dirname, "src/lib/routerShim.tsx"),
    };
    return config;
  },
  async rewrites() {
    // Remote-only `NEXT_PUBLIC_API_ORIGIN` (e.g. https://api.example.com): browser hits API directly; no proxy.
    if (!useLocalApiRewrites()) return [];
    return [
      { source: "/api/:path*", destination: "http://127.0.0.1:5050/api/:path*" },
      { source: "/uploads/:path*", destination: "http://127.0.0.1:5050/uploads/:path*" },
    ];
  },
};

export default nextConfig;
