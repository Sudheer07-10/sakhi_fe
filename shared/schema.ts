import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const leads = pgTable("leads", {
  lead_id: varchar("lead_id", { length: 255 }).primaryKey(),
  first_name: varchar("first_name", { length: 255 }).notNull(),
  last_name: varchar("last_name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  age: varchar("age", { length: 10 }),
  source: varchar("source", { length: 100 }),
  campaign: varchar("campaign", { length: 255 }),
  utm_source: varchar("utm_source", { length: 100 }),
  utm_medium: varchar("utm_medium", { length: 100 }),
  utm_campaign: varchar("utm_campaign", { length: 255 }),
  inquiry_type: varchar("inquiry_type", { length: 255 }),
  priority: varchar("priority", { length: 50 }),
  status: varchar("status", { length: 50 }),
  assigned_to: varchar("assigned_to", { length: 255 }),
  clinic_id: varchar("clinic_id", { length: 255 }),
  notes: text("notes"),
  last_contact_date: varchar("last_contact_date", { length: 255 }),
  next_follow_up_date: varchar("next_follow_up_date", { length: 255 }),
  converted_date: varchar("converted_date", { length: 255 }),
  created_at: varchar("created_at", { length: 255 }),
  updated_at: varchar("updated_at", { length: 255 }),
});

export type Lead = typeof leads.$inferSelect;

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  isUser: text("is_user").notNull().default("false"),
  lang: varchar("lang", { length: 10 }).default("en"),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// ==========================================
// Sakhi Web MVP v3.1 Specification Contracts
// ==========================================

export type Language = "en" | "te" | "tinglish";
export type PathwayMode = "pre_care" | "post_care_self_reported";
export type ResponseState =
  | "EDUCATE"
  | "CLARIFY"
  | "ABSTAIN"
  | "URGENT_GUIDANCE"
  | "SHARE_SUMMARY"
  | "SIMULATED_ESCALATION";

export interface TreatmentContext {
  category: string;
  stage: string;
  timeframe?: string;
  concern?: string;
  consented: boolean;
  provenance: "self_reported";
}

export interface SourceCitation {
  id: string;
  title: string;
  evidenceStatus: string;
  limits: string;
}

export interface SakhiSession {
  sessionId: string;
  email: string;
  language: Language;
  mode: PathwayMode;
  treatmentContext?: TreatmentContext | null;
  postCareEmailConsent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const createSessionSchema = z.object({
  email: z.string().email("Valid contact email required"),
  language: z.enum(["en", "te", "tinglish"]).default("en"),
  mode: z.enum(["pre_care", "post_care_self_reported"]).default("pre_care"),
  treatmentContext: z
    .object({
      category: z.string().default("General"),
      stage: z.string().default("General"),
      timeframe: z.string().optional(),
      concern: z.string().optional(),
      consented: z.boolean().default(true),
      provenance: z.literal("self_reported").default("self_reported"),
    })
    .optional(),
  postCareEmailConsent: z.boolean().optional(),
});

export const updateContextSchema = z.object({
  sessionId: z.string().optional(),
  treatmentContext: z
    .object({
      category: z.string(),
      stage: z.string(),
      timeframe: z.string().optional(),
      concern: z.string().optional(),
      consented: z.boolean().default(true),
      provenance: z.literal("self_reported").default("self_reported"),
    })
    .nullable()
    .optional(),
  postCareEmailConsent: z.boolean().optional(),
  email: z.string().email().optional(),
  language: z.enum(["en", "te", "tinglish"]).optional(),
  mode: z.enum(["pre_care", "post_care_self_reported"]).optional(),
});

export interface DemoTrace {
  requestId: string;
  timestamp: string;
  mode: PathwayMode;
  language: Language;
  responseState: ResponseState;
  model: string;
  latencyMs: number;
  retrievedSources: SourceCitation[];
  safetyCheckPassed: boolean;
  isSimulated: true;
}
