import type { ReservationStatus } from "@/lib/reservation-status"
import type { ResourceType } from "@/lib/resources"

export type ReservationRow = {
  id: string
  resourceName: string
  resourceType: ResourceType
  requesterName: string
  when: string
  purpose: string
  status: ReservationStatus
  rejectionReason: string | null
}

export type EquipmentRow = ReservationRow

export type BookingFormData = {
  users: { id: string; name: string; email: string }[]
  resources: { id: string; name: string; type: ResourceType }[]
}
