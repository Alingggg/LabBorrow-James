import type { resources } from "@/db/schema"

export type ResourceSummary = Pick<
  typeof resources.$inferSelect,
  "id" | "name" | "description" | "type" | "status" | "accessScope" | "maxReservationMinutes"
>
