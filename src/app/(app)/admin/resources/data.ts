import "server-only"

import { asc, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { resources } from "@/db/schema"
import { requireAdmin } from "@/data/auth"
import type { ResourceSummary } from "./types"

const selection = {
  id: resources.id,
  name: resources.name,
  description: resources.description,
  type: resources.type,
  status: resources.status,
  accessScope: resources.accessScope,
  maxReservationMinutes: resources.maxReservationMinutes,
}

export async function getResources(): Promise<ResourceSummary[]> {
  await requireAdmin()
  return db
    .select(selection)
    .from(resources)
    .orderBy(asc(resources.name))
}

export async function getResource(resourceId: string): Promise<ResourceSummary | null> {
  await requireAdmin()
  if (!z.uuid().safeParse(resourceId).success) return null

  const [item] = await db
    .select(selection)
    .from(resources)
    .where(eq(resources.id, resourceId))
    .limit(1)
  return item ?? null
}
