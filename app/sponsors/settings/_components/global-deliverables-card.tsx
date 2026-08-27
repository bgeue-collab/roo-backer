import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeliverableTemplateDialog } from "./deliverable-template-dialog";
import { DeleteTemplateButton } from "./delete-template-button";

type Template = {
  id: string;
  title: string;
  description: string | null;
  weeksFromStart: number;
  resourceUrl: string | null;
};

export function GlobalDeliverablesCard({ templates }: { templates: Template[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <CardTitle>Templates</CardTitle>
        <Badge variant="secondary">Global — all tiers</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Applied to every sponsor when they&apos;re created, regardless of tier.
        </p>
        {templates.map((template) => (
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
                tierId={null}
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
          tierId={null}
          trigger={
            <Button variant="outline" size="sm" className="w-fit">
              Add global deliverable template
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
}
