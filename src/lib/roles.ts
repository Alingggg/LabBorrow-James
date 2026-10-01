export const userRoleValues = [
  "STUDENT",
  "FACULTY",
  "RESOURCE_STAFF",
  "ADMIN",
] as const

export type UserRole = (typeof userRoleValues)[number]

