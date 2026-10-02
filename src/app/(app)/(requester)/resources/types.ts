import type { resources } from "@/db/schema"

export type CatalogResource = Pick<
  typeof resources.$inferSelect,
  "id" | "name" | "description" | "type" | "accessScope"
>

export type BookedSlot = { id: string; when: string }
