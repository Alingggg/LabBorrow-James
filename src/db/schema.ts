import { defineRelationsPart, sql } from "drizzle-orm"
import {
  boolean,
  check,
  index,
  pgEnum,
  smallint,
  snakeCase,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { reservationStatuses } from "@/lib/reservation-status"
import { resourceStatuses, resourceTypes } from "@/lib/resources"
import { userRoleValues } from "@/lib/roles"

export const userRole = pgEnum("user_role", userRoleValues)
export const resourceType = pgEnum("resource_type", resourceTypes)
export const resourceStatus = pgEnum("resource_status", resourceStatuses)
export const reservationStatus = pgEnum("reservation_status", reservationStatuses)

export const user = snakeCase.table("user", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().default(false).notNull(),
  image: text(),
  role: userRole().default("STUDENT").notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const session = snakeCase.table(
  "session",
  {
    id: text().primaryKey(),
    expiresAt: timestamp().notNull(),
    token: text().notNull().unique(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
)

export const account = snakeCase.table(
  "account",
  {
    id: text().primaryKey(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp(),
    refreshTokenExpiresAt: timestamp(),
    scope: text(),
    password: text(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
)

export const verification = snakeCase.table(
  "verification",
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
)

export const facilitySettings = snakeCase.table(
  "facility_settings",
  {
    id: text().primaryKey().default("default"),
    institutionName: text()
      .default("LabReserve Campus")
      .notNull(),
    email: text().default("").notNull(),
    phone: text().default("").notNull(),
    address: text().default("").notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    check("facility_settings_singleton", sql`${table.id} = 'default'`),
  ]
)

export const operatingHours = snakeCase.table(
  "operating_hours",
  {
    id: uuid().defaultRandom().primaryKey(),
    dayOfWeek: smallint().notNull(),
    openTime: time(),
    closeTime: time(),
    isClosed: boolean().default(false).notNull(),
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

export const resources = snakeCase.table(
  "resources",
  {
    id: uuid().defaultRandom().primaryKey(),
    name: text().notNull(),
    description: text(),
    type: resourceType().notNull(),
    status: resourceStatus().default("AVAILABLE").notNull(),
    createdAt: timestamp({ withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("resources_name_uidx").on(table.name),
    index("resources_type_status_idx").on(table.type, table.status),
  ]
)

export const reservations = snakeCase.table(
  "reservations",
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id),
    resourceId: uuid()
      .notNull()
      .references(() => resources.id),
    startAt: timestamp({ withTimezone: true }).notNull(),
    endAt: timestamp({ withTimezone: true }).notNull(),
    purpose: text().notNull(),
    status: reservationStatus().notNull(),
    reviewedBy: text().references(() => user.id),
    reviewedAt: timestamp({ withTimezone: true }),
    rejectionReason: text(),
    createdAt: timestamp({ withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    check("reservations_valid_range", sql`${table.endAt} > ${table.startAt}`),
    index("reservations_resource_start_idx").on(table.resourceId, table.startAt),
    index("reservations_status_start_idx").on(table.status, table.startAt),
    index("reservations_user_idx").on(table.userId),
  ]
)

export const reservationStatusHistory = snakeCase.table(
  "reservation_status_history",
  {
    id: uuid().defaultRandom().primaryKey(),
    reservationId: uuid()
      .notNull()
      .references(() => reservations.id),
    fromStatus: reservationStatus(),
    toStatus: reservationStatus().notNull(),
    changedBy: text()
      .notNull()
      .references(() => user.id),
    changedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .notNull(),
    reason: text(),
  },
  (table) => [
    index("reservation_status_history_reservation_idx").on(table.reservationId),
  ]
)

export const equipmentCheckouts = snakeCase.table(
  "equipment_checkouts",
  {
    id: uuid().defaultRandom().primaryKey(),
    reservationId: uuid()
      .notNull()
      .references(() => reservations.id),
    checkedOutBy: text()
      .notNull()
      .references(() => user.id),
    checkedOutAt: timestamp({ withTimezone: true })
      .defaultNow()
      .notNull(),
    returnedTo: text().references(() => user.id),
    returnedAt: timestamp({ withTimezone: true }),
    notes: text().default("").notNull(),
  },
  (table) => [
    uniqueIndex("equipment_checkouts_reservation_uidx").on(table.reservationId),
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
    reservations,
    reservationStatusHistory,
    equipmentCheckouts,
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
