"use server"

import { revalidatePath } from "next/cache"

import { db } from "@/db"
import { facilitySettings, operatingHours } from "@/db/schema"
import { unexpectedError, validate } from "@/lib/action-helpers"
import type { ActionResult } from "@/types/action-result"
import { authorizeAdmin } from "@/data/auth"
import {
  facilityInputSchema,
  operatingHoursInputSchema,
  type FacilityInput,
  type OperatingHoursInput,
} from "./schemas"

export async function updateFacilityAction(
  values: FacilityInput
): Promise<ActionResult<FacilityInput>> {
  try {
    const auth = await authorizeAdmin()
    if ("failure" in auth) return auth.failure

    const parsed = validate(facilityInputSchema, values)
    if ("failure" in parsed) return parsed.failure
    const input = parsed.data

    await db
      .insert(facilitySettings)
      .values({ id: "default", ...input })
      .onConflictDoUpdate({
        target: facilitySettings.id,
        set: { ...input, updatedAt: new Date() },
      })

    revalidatePath("/admin")
    revalidatePath("/admin/settings")
    return { ok: true, data: input }
  } catch (error) {
    return unexpectedError(error)
  }
}

export async function updateOperatingHoursAction(
  values: OperatingHoursInput
): Promise<ActionResult> {
  try {
    const auth = await authorizeAdmin()
    if ("failure" in auth) return auth.failure

    const parsed = validate(operatingHoursInputSchema, values)
    if ("failure" in parsed) return parsed.failure

    await db.transaction(async (tx) => {
      for (const day of parsed.data.days) {
        const closed = day.status === "CLOSED"
        const set = {
          isClosed: closed,
          openTime: closed ? null : day.openTime,
          closeTime: closed ? null : day.closeTime,
        }
        await tx
          .insert(operatingHours)
          .values({ dayOfWeek: day.weekday, ...set })
          .onConflictDoUpdate({ target: operatingHours.dayOfWeek, set })
      }
    })

    revalidatePath("/admin/settings")
    return { ok: true, data: undefined }
  } catch (error) {
    return unexpectedError(error)
  }
}
