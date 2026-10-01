import { defineRelationsPart, sql } from "drizzle-orm"
import {
  boolean,
  check,
  index,
  pgEnum,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { userRoleValues } from "@/lib/roles"

export const userRole = pgEnum("user_role", userRoleValues)
export const resourceType = pgEnum("resource_type", [
  "LAB",
  "ROOM",
  "EQUIPMENT",
])
export const resourceStatus = pgEnum("resource_status", [
  "AVAILABLE",
  "UNAVAILABLE",
  "RETIRED",
])

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: userRole("role").default("STUDENT").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
)

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
)

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
)

export const facilitySettings = pgTable(
  "facility_settings",
  {
    id: text("id").primaryKey().default("default"),
    institutionName: text("institution_name")
      .default("LabReserve Campus")
      .notNull(),
    timezone: text("timezone").default("Asia/Manila").notNull(),
    email: text("email").default("").notNull(),
    phone: text("phone").default("").notNull(),
    address: text("address").default("").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    check("facility_settings_singleton", sql`${table.id} = 'default'`),
  ]
)

export const operatingHours = pgTable(
  "operating_hours",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    dayOfWeek: smallint("day_of_week").notNull(),
    openTime: time("open_time"),
    closeTime: time("close_time"),
    isClosed: boolean("is_closed").default(false).notNull(),
  },
  (table) => [
    uniqueIndex("operating_hours_day_uidx").on(table.dayOfWeek),
    check("operating_hours_day_range", sql`${table.dayOfWeek} between 0 and 6`),
    check(
      "operating_hours_valid_range",
      sql`(${table.isClosed} and ${table.openTime} is null and ${table.closeTime} is null) or (not ${table.isClosed} and ${table.openTime} is not null and ${table.closeTime} is not null and ${table.openTime} < ${table.closeTime})`
    ),
  ]
)

export const resources = pgTable(
  "resources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    type: resourceType("type").notNull(),
    status: resourceStatus("status").default("AVAILABLE").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("resources_name_uidx").on(table.name),
    index("resources_type_status_idx").on(table.type, table.status),
  ]
)

export const appRelations = defineRelationsPart(
  {
    user,
    session,
    account,
    verification,
    facilitySettings,
    operatingHours,
    resources,
  },
  (r) => ({
    user: {
      sessions: r.many.session({ from: r.user.id, to: r.session.userId }),
      accounts: r.many.account({ from: r.user.id, to: r.account.userId }),
    },
    session: {
      user: r.one.user({ from: r.session.userId, to: r.user.id }),
    },
    account: {
      user: r.one.user({ from: r.account.userId, to: r.user.id }),
    },
  })
)
