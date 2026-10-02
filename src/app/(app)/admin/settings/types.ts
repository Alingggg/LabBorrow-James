import type { facilitySettings } from "@/db/schema"

export type FacilitySettingsDto = Pick<
  typeof facilitySettings.$inferSelect,
  "institutionName" | "email" | "phone" | "address"
>
