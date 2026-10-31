"use client"

import { LoaderCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { completeReservationAction } from "../actions"

export function CompleteButton({ reservationId }: { reservationId: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function complete() {
    setPending(true)
    const result = await completeReservationAction({ reservationId })
    setPending(false)
    if (!result.ok) {
      toast.error(result.message)
      return
    }
    toast.success("Reservation completed.")
    router.refresh()
  }

  return (
    <Button size="sm" variant="outline" onClick={complete} disabled={pending}>
      {pending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
      Complete
    </Button>
  )
}
