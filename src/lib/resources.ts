export const resourceTypes = ["ROOM", "EQUIPMENT"] as const
export type ResourceType = (typeof resourceTypes)[number]

export const resourceStatuses = ["AVAILABLE", "UNAVAILABLE", "RETIRED"] as const
export type ResourceStatus = (typeof resourceStatuses)[number]
