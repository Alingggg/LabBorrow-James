import type { ReservationStatus } from "@/lib/reservation-status"

export type ReservationView = "upcoming" | "previous"

export type MyReservationRow = {
  id: string
  resourceName: string
  when: string
  purpose: string
  status: ReservationStatus
  rejectionReason: string | null
  canCancel: boolean
}
