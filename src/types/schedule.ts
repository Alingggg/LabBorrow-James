import type { ReservationStatus } from "@/lib/reservation-status"
import type { ResourceType } from "@/lib/resources"

// Minutes are school-local minutes since midnight of the viewed day
export type ScheduleSlot = {
  id: string
  when: string
  startLabel: string
  status: ReservationStatus
  startMinute: number
  endMinute: number
  // Staff-only fields; left out of the requester schedule
  requesterName?: string
  purpose?: string
  overdue?: boolean
}

export type ScheduleResource = {
  id: string
  name: string
  type: ResourceType
  slots: ScheduleSlot[]
}

export type ScheduleHours = { label: string; openMinute: number; closeMinute: number }

export type DaySchedule = {
  hours: ScheduleHours | null
  resources: ScheduleResource[]
}
