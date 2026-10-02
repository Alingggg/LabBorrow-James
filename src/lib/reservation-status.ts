export const reservationStatuses = [
  "PENDING_APPROVAL",
  "CONFIRMED",
  "REJECTED",
  "CANCELLED",
  "CHECKED_OUT",
  "RETURNED",
  "COMPLETED",
] as const

export type ReservationStatus = (typeof reservationStatuses)[number]

export const activeReservationStatuses = [
  "PENDING_APPROVAL",
  "CONFIRMED",
  "CHECKED_OUT",
] as const satisfies readonly ReservationStatus[]

const transitions: Record<ReservationStatus, readonly ReservationStatus[]> = {
  PENDING_APPROVAL: ["CONFIRMED", "REJECTED", "CANCELLED"],
  CONFIRMED: ["CHECKED_OUT", "CANCELLED", "COMPLETED"],
  CHECKED_OUT: ["RETURNED"],
  RETURNED: ["COMPLETED"],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: [],
}

export function canTransition(from: ReservationStatus, to: ReservationStatus) {
  return transitions[from].includes(to)
}
