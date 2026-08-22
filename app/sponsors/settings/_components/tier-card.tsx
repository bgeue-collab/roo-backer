import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { TierFormDialog } from "./tier-form-dialog";
import { DeleteTierButton } from "./delete-tier-button";
import { DeliverableTemplateDialog } from "./deliverable-template-dialog";
import { DeleteTemplateButton } from "./delete-template-button";

type Template = {
  id: string;
  title: string;
  description: string | null;
  weeksFromStart: number;
};

export function TierCard({
  tier,
}: {
  tier: {
    id: string;
    name: string;
    minAmount: string;
    sortOrder: number;
    templates: Template[];
  };
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {tier.name}{" "}
          <span className="font-normal text-muted-foreground">
            {formatMoney(tier.minAmount)}+
          </span>
        </CardTitle>
        <div className="flex gap-1">
          <TierFormDialog
            tierId={tier.id}
            initialValues={{
              name: tier.name,
              minAmount: tier.minAmount,
              sortOrder: tier.sortOrder,
            }}
            trigger={
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            }
          />
          <DeleteTierButton tierId={tier.id} tierName={tier.name} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {tier.templates.map((template) => (
          <div
            key={template.id}
            className="flex items-center justify-between gap-2 rounded-lg border p-2 text-sm"
          >
            <div className="flex flex-col">
              <span className="font-medium">{template.title}</span>
              {template.description ? (
                <span className="text-muted-foreground">
                  {template.description}
                </span>
              ) : null}
              <span className="text-muted-foreground">
                {template.weeksFromStart} week
                {template.weeksFromStart === 1 ? "" : "s"} from signup
              </span>
            </div>
            <div className="flex items-center gap-1">
              <DeliverableTemplateDialog
                tierId={tier.id}
                template={template}
                trigger={
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                }
              />
              <DeleteTemplateButton templateId={template.id} />
            </div>
          </div>
        ))}
        <DeliverableTemplateDialog
          tierId={tier.id}
          trigger={
            <Button variant="outline" size="sm" className="w-fit">
              Add deliverable template
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
}
