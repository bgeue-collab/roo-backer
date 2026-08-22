import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrgSettings } from "@/lib/db/org-settings";
import { BottomNav } from "./_components/bottom-nav";
import { SignOutButton } from "./_components/sign-out-button";

export default async function SponsorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin");
  }

  const settings = await getOrgSettings();
  const orgName = settings?.orgName ?? "RooBacker";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          {settings?.logoUrl ? (
            // Logo URL is club-supplied and arbitrary, so next/image's
            // remotePatterns allowlist isn't a good fit here.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logoUrl}
              alt={orgName}
              width={28}
              height={28}
              className="rounded"
            />
          ) : null}
          <span className="font-semibold">{orgName}</span>
        </div>
        <SignOutButton />
      </header>
      <main className="flex-1 pb-16">{children}</main>
      <BottomNav />
    </div>
  );
}
