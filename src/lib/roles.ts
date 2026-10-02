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

// Students join in Milestone 4
export function isRequesterRole(role: UserRole) {
  return role === "FACULTY"
}

export function homeFor(role: UserRole) {
  if (role === "ADMIN") return "/admin"
  if (role === "RESOURCE_STAFF") return "/staff"
  if (isRequesterRole(role)) return "/resources"
  return null
}
