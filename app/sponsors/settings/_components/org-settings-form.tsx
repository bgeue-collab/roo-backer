"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOrgSettings } from "@/app/actions/org-settings";

export function OrgSettingsForm({
  initialValues,
}: {
  initialValues: {
    orgName: string;
    orgFullName: string;
    primaryColor: string;
    logoUrl: string;
  };
}) {
  const [values, setValues] = useState(initialValues);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateOrgSettings(values);
        toast.success("Organisation settings updated.");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Couldn't save settings."
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="orgName">Organisation short name</Label>
        <Input
          id="orgName"
          value={values.orgName}
          onChange={(e) => setValues((v) => ({ ...v, orgName: e.target.value }))}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="orgFullName">Organisation full name</Label>
        <Input
          id="orgFullName"
          value={values.orgFullName}
          onChange={(e) =>
            setValues((v) => ({ ...v, orgFullName: e.target.value }))
          }
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="primaryColor">Primary colour (hex)</Label>
          <Input
            id="primaryColor"
            value={values.primaryColor}
            onChange={(e) =>
              setValues((v) => ({ ...v, primaryColor: e.target.value }))
            }
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input
            id="logoUrl"
            value={values.logoUrl}
            onChange={(e) => setValues((v) => ({ ...v, logoUrl: e.target.value }))}
          />
        </div>
      </div>
      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Saving..." : "Save organisation settings"}
      </Button>
    </form>
  );
}
