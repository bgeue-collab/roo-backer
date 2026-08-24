import type { MetadataRoute } from "next";
import { getOrgSettings } from "@/lib/db/org-settings";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getOrgSettings();
  const orgName = settings?.orgName ?? "RooBacker";
  const primaryColor = settings?.primaryColor ?? "#0F766E";

  return {
    name: orgName,
    short_name: orgName,
    description: `Sponsor CRM for ${settings?.orgFullName ?? orgName}`,
    start_url: "/sponsors",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: primaryColor,
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
