import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getOrgSettings } from "@/lib/db/org-settings";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getOrgSettings();
  const orgName = settings?.orgName ?? "RooBacker";
  const orgFullName =
    settings?.orgFullName ?? "The RoboRoos - Student Robotics Club of SA Inc.";

  return {
    title: orgName,
    description: `Sponsor CRM for ${orgFullName}`,
  };
}

export async function generateViewport(): Promise<Viewport> {
  const settings = await getOrgSettings();
  return {
    themeColor: settings?.primaryColor ?? "#0F766E",
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
