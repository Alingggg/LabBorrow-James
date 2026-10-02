import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/db"
import { facilitySettings } from "@/db/schema"

const DEFAULT_INSTITUTION_NAME = "LabReserve Campus"

export async function getInstitutionName() {
  const [settings] = await db
    .select({ institutionName: facilitySettings.institutionName })
    .from(facilitySettings)
    .where(eq(facilitySettings.id, "default"))
    .limit(1)
  return settings?.institutionName ?? DEFAULT_INSTITUTION_NAME
}
