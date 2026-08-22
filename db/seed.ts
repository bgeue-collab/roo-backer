import { db } from "./index";
import { orgSettings, sponsorTiers, tierDeliverableTemplates } from "./schema";

type TemplateSeed = {
  title: string;
  description: string;
  weeksFromStart: number;
};

type TierSeed = {
  name: string;
  minAmount: string;
  sortOrder: number;
  templates: TemplateSeed[];
};

const tierSeeds: TierSeed[] = [
  {
    name: "Bronze",
    minAmount: "1000",
    sortOrder: 1,
    templates: [
      {
        title: "Website recognition",
        description: "List the sponsor's name and logo on the club website.",
        weeksFromStart: 1,
      },
      {
        title: "Social media recognition",
        description: "Post a thank-you shoutout on the club's social media accounts.",
        weeksFromStart: 1,
      },
      {
        title: "Digital sponsor badge",
        description: "Send the sponsor a digital badge they can use in their own marketing.",
        weeksFromStart: 1,
      },
      {
        title: "Downloadable team/robot photo with thank-you message",
        description: "Send a downloadable team or robot photo with a personalised thank-you message.",
        weeksFromStart: 2,
      },
    ],
  },
  {
    name: "Silver",
    minAmount: "2500",
    sortOrder: 2,
    templates: [
      {
        title: "Logo on website",
        description: "Add the sponsor's logo to the club website.",
        weeksFromStart: 1,
      },
      {
        title: "Social media recognition",
        description: "Post a thank-you shoutout on the club's social media accounts.",
        weeksFromStart: 1,
      },
      {
        title: "Logo on team shirts",
        description: "Print the sponsor's logo on the team's shirts.",
        weeksFromStart: 3,
      },
      {
        title: "Select team event invitation",
        description: "Invite the sponsor to a select team event.",
        weeksFromStart: 6,
      },
    ],
  },
  {
    name: "Gold",
    minAmount: "5000",
    sortOrder: 3,
    templates: [
      {
        title: "Logo on website",
        description: "Add the sponsor's logo to the club website.",
        weeksFromStart: 1,
      },
      {
        title: "Social media recognition",
        description: "Post a thank-you shoutout on the club's social media accounts.",
        weeksFromStart: 1,
      },
      {
        title: "Logo on robot",
        description: "Display the sponsor's logo on the competition robot.",
        weeksFromStart: 2,
      },
      {
        title: "Logo on shirts",
        description: "Print the sponsor's logo on the team's shirts.",
        weeksFromStart: 3,
      },
      {
        title: "Newsletter recognition",
        description: "Mention the sponsor in the club newsletter.",
        weeksFromStart: 4,
      },
      {
        title: "Sponsor event invitation",
        description: "Invite the sponsor to a club sponsor event.",
        weeksFromStart: 6,
      },
    ],
  },
  {
    name: "Platinum",
    minAmount: "10000",
    sortOrder: 4,
    templates: [
      {
        title: "Logo on website",
        description: "Add the sponsor's logo to the club website.",
        weeksFromStart: 1,
      },
      {
        title: "Logo on social media",
        description: "Feature the sponsor's logo across the club's social media accounts.",
        weeksFromStart: 1,
      },
      {
        title: "Logo on robot",
        description: "Display the sponsor's logo on the competition robot.",
        weeksFromStart: 2,
      },
      {
        title: "Logo on shirts",
        description: "Print the sponsor's logo on the team's shirts.",
        weeksFromStart: 3,
      },
      {
        title: "Logo on banners",
        description: "Display the sponsor's logo on club banners at events.",
        weeksFromStart: 3,
      },
      {
        title: "Named recognition in newsletter",
        description: "Give the sponsor a named mention in the club newsletter.",
        weeksFromStart: 4,
      },
      {
        title: "Exclusive sponsor event invitation",
        description: "Invite the sponsor to an exclusive sponsor-only event.",
        weeksFromStart: 6,
      },
      {
        title: "Custom team demonstration",
        description: "Arrange a custom robot demonstration for the sponsor.",
        weeksFromStart: 8,
      },
    ],
  },
];

async function seed() {
  const existingOrgSettings = await db.select().from(orgSettings).limit(1);
  if (existingOrgSettings.length === 0) {
    await db.insert(orgSettings).values({});
    console.log("Seeded org_settings default row.");
  } else {
    console.log("org_settings already has a row, skipping.");
  }

  const existingTiers = await db.select().from(sponsorTiers).limit(1);
  if (existingTiers.length > 0) {
    console.log("sponsor_tiers already seeded, skipping tiers + templates.");
    return;
  }

  for (const tierSeed of tierSeeds) {
    const [tier] = await db
      .insert(sponsorTiers)
      .values({
        name: tierSeed.name,
        minAmount: tierSeed.minAmount,
        sortOrder: tierSeed.sortOrder,
      })
      .returning();

    await db.insert(tierDeliverableTemplates).values(
      tierSeed.templates.map((template) => ({
        tierId: tier.id,
        title: template.title,
        description: template.description,
        weeksFromStart: template.weeksFromStart,
      }))
    );

    console.log(`Seeded tier ${tierSeed.name} with ${tierSeed.templates.length} templates.`);
  }
}

seed()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
