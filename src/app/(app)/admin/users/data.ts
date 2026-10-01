import "server-only"

import { asc } from "drizzle-orm"

import { db } from "@/db"
import { user } from "@/db/schema"
import { requireAdmin } from "@/lib/session"

export async function listUsers() {
  const currentUser = await requireAdmin()
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(asc(user.name))
  return { currentUser, users }
}
