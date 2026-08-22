import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orgSettings } from "@/db/schema";

export async function getOrgSettings() {
  const [settings] = await db.select().from(orgSettings).limit(1);
  return settings ?? null;
}

export async function updateOrgSettings(data: {
  orgName: string;
  orgFullName: string;
  primaryColor: string;
  logoUrl: string | null;
}) {
  const existing = await getOrgSettings();

  if (!existing) {
    const [created] = await db
      .insert(orgSettings)
      .values({ ...data, updatedAt: new Date() })
      .returning();
    return created;
  }

  const [updated] = await db
    .update(orgSettings)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(orgSettings.id, existing.id))
    .returning();
  return updated;
}
