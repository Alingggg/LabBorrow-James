"use client"

import { ReasonSheet } from "@/components/ReasonSheet"
import { Button } from "@/components/ui/button"
import { cancelMyReservationAction } from "../actions"

export function CancelReservationButton({ reservationId }: { reservationId: string }) {
  return (
    <ReasonSheet
      trigger={<Button size="sm" variant="outline">Cancel</Button>}
      title="Cancel reservation"
      label="Reason (optional)"
      required={false}
      submitLabel="Cancel reservation"
      successMessage="Reservation cancelled."
      onSubmit={(reason) => cancelMyReservationAction({ reservationId, reason })}
    />
  )
}
