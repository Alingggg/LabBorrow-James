import "server-only"

import { and, eq, inArray } from "drizzle-orm"

import { resources } from "@/db/schema"
import { scopesForRole } from "@/lib/resources"
import type { UserRole } from "@/lib/roles"

export const visibleTo = (role: UserRole) =>
  and(
    eq(resources.status, "AVAILABLE"),
    inArray(resources.accessScope, scopesForRole(role))
  )
