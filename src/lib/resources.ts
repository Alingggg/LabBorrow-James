import { formatDuration } from "date-fns"

import type { UserRole } from "@/lib/roles"

export const resourceTypes = ["ROOM", "EQUIPMENT"] as const
export type ResourceType = (typeof resourceTypes)[number]

export const resourceStatuses = ["AVAILABLE", "UNAVAILABLE", "RETIRED"] as const
export type ResourceStatus = (typeof resourceStatuses)[number]

export const accessScopes = ["ALL_USERS", "FACULTY_STAFF"] as const
export type AccessScope = (typeof accessScopes)[number]

export const accessScopeLabels: Record<AccessScope, string> = {
  ALL_USERS: "All users",
  FACULTY_STAFF: "Faculty and staff",
}

export function scopesForRole(role: UserRole): AccessScope[] {
  return role === "STUDENT" ? ["ALL_USERS"] : [...accessScopes]
}

export function formatMaxDuration(minutes: number) {
  return formatDuration({ hours: Math.floor(minutes / 60), minutes: minutes % 60 })
}
