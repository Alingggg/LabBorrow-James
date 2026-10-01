export const resourceTypes = ["LAB", "ROOM", "EQUIPMENT"] as const
export type ResourceType = (typeof resourceTypes)[number]

export const resourceStatuses = ["AVAILABLE", "UNAVAILABLE", "RETIRED"] as const
export type ResourceStatus = (typeof resourceStatuses)[number]

export type ResourceSummary = {
  id: string
  name: string
  description: string
  type: ResourceType
  status: ResourceStatus
}

export type FacilitySettingsDto = {
  institutionName: string
  email: string
  phone: string
  address: string
}

export type ActionErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INVALID_STATE"
  | "DATABASE_ERROR"

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | {
      ok: false
      code: ActionErrorCode
      message: string
      fieldErrors?: Record<string, string[]>
    }
