import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  date,
} from "drizzle-orm/pg-core";

export const orgSettings = pgTable("org_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgName: text("org_name").notNull().default("RooBacker"),
  orgFullName: text("org_full_name")
    .notNull()
    .default("The RoboRoos - Student Robotics Club of SA Inc."),
  primaryColor: text("primary_color").notNull().default("#0F766E"),
  logoUrl: text("logo_url"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sponsorTiers = pgTable("sponsor_tiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  minAmount: numeric("min_amount", { precision: 10, scale: 2 }).notNull(),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tierDeliverableTemplates = pgTable("tier_deliverable_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Null means the template applies to every sponsor regardless of tier.
  tierId: uuid("tier_id").references(() => sponsorTiers.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  weeksFromStart: integer("weeks_from_start").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sponsors = pgTable("sponsors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  pledgedAmount: numeric("pledged_amount", {
    precision: 10,
    scale: 2,
  }).notNull(),
  tierId: uuid("tier_id")
    .notNull()
    .references(() => sponsorTiers.id, { onDelete: "restrict" }),
  notes: text("notes"),
  sponsorshipStartDate: date("sponsorship_start_date"),
  xeroContactId: text("xero_contact_id"),
  // 'active' | 'inactive' — a visibility/calculation filter, not a soft-delete.
  status: text("status").notNull().default("active"),
  doNotContact: boolean("do_not_contact").notNull().default(false),
  doNotContactReason: text("do_not_contact_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sponsorContacts = pgTable("sponsor_contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  sponsorId: uuid("sponsor_id")
    .notNull()
    .references(() => sponsors.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role"),
  email: text("email"),
  phone: text("phone"),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sponsorLiaisons = pgTable("sponsor_liaisons", {
  id: uuid("id").primaryKey().defaultRandom(),
  sponsorId: uuid("sponsor_id")
    .notNull()
    .references(() => sponsors.id, { onDelete: "cascade" }),
  volunteerName: text("volunteer_name").notNull(),
  volunteerEmail: text("volunteer_email"),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sponsorSocials = pgTable("sponsor_socials", {
  id: uuid("id").primaryKey().defaultRandom(),
  sponsorId: uuid("sponsor_id")
    .notNull()
    .references(() => sponsors.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  handle: text("handle").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  sponsorId: uuid("sponsor_id")
    .notNull()
    .references(() => sponsors.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("AUD"),
  paidDate: date("paid_date").notNull(),
  paymentType: text("payment_type").notNull().default("cash"),
  description: text("description"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const deliverables = pgTable("deliverables", {
  id: uuid("id").primaryKey().defaultRandom(),
  sponsorId: uuid("sponsor_id")
    .notNull()
    .references(() => sponsors.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: date("due_date").notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  completedBy: text("completed_by"),
  dueDateOverridden: boolean("due_date_overridden").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  deliverableId: uuid("deliverable_id")
    .notNull()
    .references(() => deliverables.id, { onDelete: "cascade" }),
  sponsorId: uuid("sponsor_id")
    .notNull()
    .references(() => sponsors.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  performedBy: text("performed_by").notNull(),
  performedAt: timestamp("performed_at").notNull().defaultNow(),
  notes: text("notes"),
});
