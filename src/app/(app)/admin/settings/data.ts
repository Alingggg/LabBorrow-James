import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/db"
import { facilitySettings } from "@/db/schema"
import { requireAdmin } from "@/lib/session"
import type { FacilitySettingsDto } from "../types"

const defaults: FacilitySettingsDto = {
  institutionName: "LabReserve Campus",
  email: "",
  phone: "",
  address: "",
}

export async function getSettingsPageData() {
  await requireAdmin()
  const [settings] = await db
    .select()
    .from(facilitySettings)
    .where(eq(facilitySettings.id, "default"))
    .limit(1)
  const facility: FacilitySettingsDto = settings
    ? {
        institutionName: settings.institutionName,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
      }
    : defaults
  return { facility }
}
