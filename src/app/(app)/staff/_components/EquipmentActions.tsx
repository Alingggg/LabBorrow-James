"use client"

import { Button } from "@/components/ui/button"
import { checkoutEquipmentAction, returnEquipmentAction } from "../actions"
import { NotesSheet } from "./NotesSheet"

export function CheckoutButton({ reservationId }: { reservationId: string }) {
  return (
    <NotesSheet
      trigger={<Button size="sm">Check out</Button>}
      title="Check out equipment"
      submitLabel="Check out"
      successMessage="Equipment checked out."
      onSubmit={(values) => checkoutEquipmentAction({ reservationId, ...values })}
    />
  )
}

export function ReturnButton({ reservationId }: { reservationId: string }) {
  return (
    <NotesSheet
      trigger={<Button size="sm">Receive return</Button>}
      title="Receive returned equipment"
      submitLabel="Record return"
      successMessage="Return recorded."
      onSubmit={(values) => returnEquipmentAction({ reservationId, ...values })}
    />
  )
}
