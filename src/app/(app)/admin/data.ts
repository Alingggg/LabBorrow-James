import "server-only"

import { count, eq } from "drizzle-orm"

import { db } from "@/db"
import { resources, user } from "@/db/schema"
import { userRoleValues, type UserRole } from "@/lib/roles"
import { requireAdmin } from "@/data/auth"

export async function getAdminOverview() {
  await requireAdmin()
  const [resourceTotal, unavailableTotal, accountTotal, roleRows] =
    await Promise.all([
      db.select({ value: count() }).from(resources),
      db
        .select({ value: count() })
        .from(resources)
        .where(eq(resources.status, "UNAVAILABLE")),
      db.select({ value: count() }).from(user),
      db
        .select({ role: user.role, value: count() })
        .from(user)
        .groupBy(user.role),
    ])

  const roleCounts = Object.fromEntries(
    userRoleValues.map((role) => [role, 0])
  ) as Record<UserRole, number>
  for (const row of roleRows) roleCounts[row.role] = row.value

  return {
    totalResources: resourceTotal[0]?.value ?? 0,
    unavailableResources: unavailableTotal[0]?.value ?? 0,
    totalAccounts: accountTotal[0]?.value ?? 0,
    roleCounts,
  }
}
