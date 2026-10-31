import "server-only"

import { and, asc, eq, gt, inArray, sql } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { reservations, resources } from "@/db/schema"
import { requireRequester } from "@/data/auth"
import { visibleTo } from "@/data/resources"
import { activeReservationStatuses } from "@/lib/reservation-status"
import type { ResourceType } from "@/lib/resources"
import type { UserRole } from "@/lib/roles"
import { formatSchoolRange } from "@/lib/school-time"
import type { BookedSlot, Resource } from "./types"

const selection = {
  id: resources.id,
  name: resources.name,
  description: resources.description,
  type: resources.type,
  accessScope: resources.accessScope,
  maxReservationMinutes: resources.maxReservationMinutes,
}

export async function getResources(type: ResourceType): Promise<Resource[]> {
  const currentUser = await requireRequester()
  return db
    .select(selection)
    .from(resources)
    .where(and(visibleTo(currentUser.role as UserRole), eq(resources.type, type)))
    .orderBy(asc(resources.name))
}

export async function getResource(
  resourceId: string
): Promise<(Resource & { booked: BookedSlot[] }) | null> {
  const currentUser = await requireRequester()
  if (!z.uuid().safeParse(resourceId).success) return null

  const [resource] = await db
    .select(selection)
    .from(resources)
    .where(and(visibleTo(currentUser.role as UserRole), eq(resources.id, resourceId)))
    .limit(1)
  if (!resource) return null

  const booked = await db
    .select({
      id: reservations.id,
      startAt: reservations.startAt,
      endAt: reservations.endAt,
      status: reservations.status,
    })
    .from(reservations)
    .where(
      and(
        eq(reservations.resourceId, resourceId),
        inArray(reservations.status, activeReservationStatuses),
        gt(reservations.endAt, sql`now()`)
      )
    )
    .orderBy(asc(reservations.startAt))
    .limit(50)

  return {
    ...resource,
    booked: booked.map(({ id, startAt, endAt, status }) => ({
      id,
      status,
      when: formatSchoolRange(startAt, endAt),
    })),
  }
}
