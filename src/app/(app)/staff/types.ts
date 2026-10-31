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
  ended: boolean
  canComplete: boolean
}
