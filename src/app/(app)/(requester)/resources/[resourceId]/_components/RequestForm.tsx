"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { FieldError } from "@/components/FieldError"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { reservationRequestSchema, type ReservationRequestInput } from "@/schemas/reservations"
import { requestReservationAction } from "../../actions"

export function RequestForm({ resourceId }: { resourceId: string }) {
  const router = useRouter()
  const form = useForm<ReservationRequestInput, unknown, z.output<typeof reservationRequestSchema>>({
    resolver: zodResolver(reservationRequestSchema),
    defaultValues: {
      resourceId,
      date: "",
      startTime: "",
      endTime: "",
      purpose: "",
    },
  })
  const { register, handleSubmit, setError, formState } = form
  const { errors } = formState

  const onSubmit = handleSubmit(async (values) => {
    const result = await requestReservationAction(values)
    if (!result.ok) {
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        const message = messages[0]
        if (message && field in values) {
          setError(field as keyof ReservationRequestInput, { message })
        }
      }
      toast.error(Object.values(result.fieldErrors ?? {})[0]?.[0] ?? result.message)
      return
    }
    toast.success("Request submitted.")
    router.push("/reservations")
    router.refresh()
  })

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" aria-invalid={!!errors.date} {...register("date")} />
          <FieldError message={errors.date?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Start time</Label>
          <Input id="startTime" type="time" aria-invalid={!!errors.startTime} {...register("startTime")} />
          <FieldError message={errors.startTime?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End time</Label>
          <Input id="endTime" type="time" aria-invalid={!!errors.endTime} {...register("endTime")} />
          <FieldError message={errors.endTime?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">Purpose</Label>
        <Textarea id="purpose" rows={3} aria-invalid={!!errors.purpose} {...register("purpose")} />
        <FieldError message={errors.purpose?.message} />
      </div>

      <Button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting && <LoaderCircle className="animate-spin" aria-hidden="true" />}
        {formState.isSubmitting ? "Submitting…" : "Request reservation"}
      </Button>
    </form>
  )
}
