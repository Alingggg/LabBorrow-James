"use client"

import { LoaderCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  approveReservationAction,
  cancelReservationAction,
  rejectReservationAction,
} from "../actions"
import { ReasonSheet } from "./ReasonSheet"

export function ApproveButton({ reservationId }: { reservationId: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function approve() {
    setPending(true)
    const result = await approveReservationAction({ reservationId })
    setPending(false)
    if (!result.ok) {
      toast.error(result.message)
      return
    }
    toast.success("Reservation approved.")
    router.refresh()
  }

  return (
    <Button size="sm" onClick={approve} disabled={pending}>
      {pending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
      Approve
    </Button>
  )
}

export function RejectButton({ reservationId }: { reservationId: string }) {
  return (
    <ReasonSheet
      trigger={<Button size="sm" variant="outline">Reject</Button>}
      title="Reject request"
      label="Reason"
      required
      submitLabel="Reject request"
      successMessage="Request rejected."
      onSubmit={(reason) => rejectReservationAction({ reservationId, reason })}
    />
  )
}

export function CancelButton({ reservationId }: { reservationId: string }) {
  return (
    <ReasonSheet
      trigger={<Button size="sm" variant="outline">Cancel</Button>}
      title="Cancel reservation"
      label="Reason (optional)"
      required={false}
      submitLabel="Cancel reservation"
      successMessage="Reservation cancelled."
      onSubmit={(reason) => cancelReservationAction({ reservationId, reason })}
    />
  )
}
