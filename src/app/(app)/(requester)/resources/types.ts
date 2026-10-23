import type { resources } from "@/db/schema"
import type { ReservationStatus } from "@/lib/reservation-status"

export type CatalogResource = Pick<
  typeof resources.$inferSelect,
  "id" | "name" | "description" | "type" | "accessScope" | "maxReservationMinutes"
>

export type BookedSlot = { id: string; when: string; status: ReservationStatus }
