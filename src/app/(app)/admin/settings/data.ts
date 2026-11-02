import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/db"
import { facilitySettings, operatingHours } from "@/db/schema"
import { requireAdmin } from "@/data/auth"
import type { OperatingHoursInput } from "./schemas"
import type { FacilitySettingsDto } from "./types"

const defaults: FacilitySettingsDto = {
  institutionName: "LabBorrow James",
  email: "",
  phone: "",
  address: "",
}

export async function getSettingsPageData() {
  await requireAdmin()
  const [[settings], hourRows] = await Promise.all([
    db
      .select()
      .from(facilitySettings)
      .where(eq(facilitySettings.id, "default"))
      .limit(1),
    db.select().from(operatingHours),
  ])
  const facility: FacilitySettingsDto = settings
    ? {
        institutionName: settings.institutionName,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
      }
    : defaults
  const hours: OperatingHoursInput = {
    days: Array.from({ length: 7 }, (_, weekday) => {
      const row = hourRows.find((item) => item.dayOfWeek === weekday)
      return row && !row.isClosed
        ? {
            weekday,
            status: "OPEN" as const,
            openTime: row.openTime?.slice(0, 5) ?? "",
            closeTime: row.closeTime?.slice(0, 5) ?? "",
          }
        : { weekday, status: "CLOSED" as const, openTime: "", closeTime: "" }
    }),
  }
  return { facility, hours }
}
