export default function HelpPage() {
    return (
      <div className="flex flex-col gap-6 p-4 pb-16 max-w-2xl">
        <div>
          <h1 className="text-2xl font-semibold">Help</h1>
          <p className="text-sm text-muted-foreground mt-1">
            A quick guide to using RooBacker.
          </p>
        </div>
  
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">What is RooBacker?</h2>
          <p className="text-sm text-muted-foreground">
            RooBacker tracks sponsors for The RoboRoos — who they are, what
            tier they're at, what we owe them (logos, mentions, event
            invites), and what they owe us (their pledged donation).
          </p>
        </section>
  
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Logging in</h2>
          <p className="text-sm text-muted-foreground">
            Sign in with your @roboroos.org.au Google account. If you don't
            have one yet, contact the committee to get set up.
          </p>
        </section>
  
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Adding a sponsor</h2>
          <p className="text-sm text-muted-foreground">
            Click "Add sponsor" and enter their name and pledged amount. The
            tier (Basic, Bronze, Silver, Gold, Platinum) is worked out
            automatically from the amount — you don't need to set it
            yourself. A set of deliverables (things we owe them) is
            automatically created based on their tier.
          </p>
          <p className="text-sm text-muted-foreground">
            You can also add contacts (people at the sponsor's company),
            social media handles, and an internal liaison (who at the club is
            the point person for this sponsor) — all optional, but useful for
            keeping track.
          </p>
        </section>
  
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Logging a payment</h2>
          <p className="text-sm text-muted-foreground">
            On a sponsor's page, use "Log payment" to record money or
            in-kind contributions (like donated equipment) received. This
            updates their "paid up" status and the dashboard's outstanding
            total.
          </p>
        </section>
  
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Deliverables and Actions</h2>
          <p className="text-sm text-muted-foreground">
            Each sponsor has a list of deliverables — things we've promised
            them, like a logo on the website or a social media shoutout.
            Tick them off as you complete them.
          </p>
          <p className="text-sm text-muted-foreground">
            The Actions tab shows everything overdue or due in the next two
            weeks, across every sponsor, so you can see what needs doing at
            a glance.
          </p>
        </section>
  
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Renewal follow-up</h2>
          <p className="text-sm text-muted-foreground">
            Every sponsor gets a yearly "renewal follow-up" reminder around
            the anniversary of when they joined. When you complete it, you'll
            be asked whether they renewed. If yes, a fresh set of
            deliverables is created and next year's reminder is queued up
            automatically.
          </p>
        </section>
  
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Inactive and do-not-contact</h2>
          <p className="text-sm text-muted-foreground">
            If a sponsor stops renewing, mark them "inactive" rather than
            deleting them — their history stays intact, and they're excluded
            from dashboard totals and new deliverables.
          </p>
          <p className="text-sm text-muted-foreground">
            "Do not contact" is separate — use it when a sponsor should never
            be emailed again (e.g. their business has closed). It shows a
            warning and asks you to confirm before drafting any email to
            them.
          </p>
        </section>
  
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Committee members can manage tier thresholds, deliverable
            templates (including ones that apply to every tier), and club
            branding from Settings.
          </p>
        </section>
  
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Questions?</h2>
          <p className="text-sm text-muted-foreground">
            Contact Rebecca if something's not working or you're not sure
            how to do something.
          </p>
        </section>
      </div>
    );
  }