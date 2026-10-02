export const userRoleValues = [
  "STUDENT",
  "FACULTY",
  "RESOURCE_STAFF",
  "ADMIN",
] as const

export type UserRole = (typeof userRoleValues)[number]


export function isStaffRole(role: UserRole) {
  return role === "RESOURCE_STAFF" || role === "ADMIN"
}
