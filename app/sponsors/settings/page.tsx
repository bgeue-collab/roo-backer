import { Button } from "@/components/ui/button";
import { getOrgSettings } from "@/lib/db/org-settings";
import { getTiers, getGlobalDeliverableTemplates } from "@/lib/db/tiers";
import { OrgSettingsForm } from "./_components/org-settings-form";
import { TierCard } from "./_components/tier-card";
import { TierFormDialog } from "./_components/tier-form-dialog";
import { GlobalDeliverablesCard } from "./_components/global-deliverables-card";

export default async function SettingsPage() {
  const [orgSettings, tiers, globalTemplates] = await Promise.all([
    getOrgSettings(),
    getTiers(),
    getGlobalDeliverableTemplates(),
  ]);

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-semibold">Organisation settings</h1>
        <OrgSettingsForm
          initialValues={{
            orgName: orgSettings?.orgName ?? "RooBacker",
            orgFullName:
              orgSettings?.orgFullName ??
              "The RoboRoos - Student Robotics Club of SA Inc.",
            primaryColor: orgSettings?.primaryColor ?? "#0F766E",
            logoUrl: orgSettings?.logoUrl ?? "",
          }}
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Global deliverables (all tiers)</h2>
        <GlobalDeliverablesCard templates={globalTemplates} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Sponsor tiers</h2>
          <TierFormDialog trigger={<Button size="sm">Add tier</Button>} />
        </div>
        <div className="flex flex-col gap-3">
          {tiers.map((tier) => (
            <TierCard key={tier.id} tier={tier} />
          ))}
        </div>
      </div>
    </div>
  );
}
