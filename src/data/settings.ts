import "server-only"

import { asc, eq } from "drizzle-orm"

import { db } from "@/db"
import { facilitySettings, operatingHours } from "@/db/schema"
import { formatClockRange, weekdayLabels } from "@/lib/school-time"

const DEFAULT_INSTITUTION_NAME = "LabReserve Campus"

export async function getInstitutionName() {
  const [settings] = await db
    .select({ institutionName: facilitySettings.institutionName })
    .from(facilitySettings)
    .where(eq(facilitySettings.id, "default"))
    .limit(1)
  return settings?.institutionName ?? DEFAULT_INSTITUTION_NAME
}

export async function getOperatingHours() {
  const rows = await db.select().from(operatingHours).orderBy(asc(operatingHours.dayOfWeek))
  return rows.map((row) => {
    const open = !row.isClosed && row.openTime && row.closeTime
    return {
      weekday: row.dayOfWeek,
      label: weekdayLabels[row.dayOfWeek] ?? "",
      hours: open ? formatClockRange(row.openTime!, row.closeTime!) : null,
      openTime: open ? row.openTime!.slice(0, 5) : null,
      closeTime: open ? row.closeTime!.slice(0, 5) : null,
    }
  })
}
