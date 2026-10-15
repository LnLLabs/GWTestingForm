import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const nonces = sqliteTable("nonces", {
  nonce: text("nonce").primaryKey(),
  purpose: text("purpose").notNull(),
  expiresAt: integer("expires_at").notNull(),
  usedAt: integer("used_at"),
});

export const participants = sqliteTable("participants", {
  stakeAddress: text("stake_address").primaryKey(),
  mainnetAddress: text("mainnet_address"),
  rewardMessage: text("reward_message"),
  rewardSignature: text("reward_signature"),
  rewardKey: text("reward_key"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const feedback = sqliteTable("feedback", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  stakeAddress: text("stake_address")
    .notNull()
    .references(() => participants.stakeAddress),
  stars: integer("stars").notNull(),
  comment: text("comment").notNull().default(""),
  changes: text("changes").notNull().default(""),
  mainnetUse: text("mainnet_use").notNull().default(""),
  createdAt: integer("created_at").notNull(),
});

export const bugs = sqliteTable("bugs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  stakeAddress: text("stake_address")
    .notNull()
    .references(() => participants.stakeAddress),
  title: text("title").notNull(),
  steps: text("steps").notNull(),
  expected: text("expected").notNull(),
  actual: text("actual").notNull(),
  suggestedSeverity: text("suggested_severity").notNull(),
  officialSeverity: text("official_severity"),
  status: text("status").notNull().default("submitted"),
  reviewerStakeAddress: text("reviewer_stake_address"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
