"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { FieldError } from "@/components/FieldError"
import { Select } from "@/components/Select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createReservationAction } from "../actions"
import type { BookingFormData } from "../types"
import { createReservationInputSchema, type CreateReservationInput } from "../schemas"

export function BookingForm({ data }: { data: BookingFormData }) {
  const router = useRouter()
  const form = useForm<CreateReservationInput, unknown, z.output<typeof createReservationInputSchema>>({
    resolver: zodResolver(createReservationInputSchema),
    defaultValues: {
      userId: "",
      resourceId: "",
      date: "",
      startTime: "",
      endTime: "",
      purpose: "",
    },
  })
  const { register, control, handleSubmit, setError, formState } = form
  const { errors } = formState

  const onSubmit = handleSubmit(async (values) => {
    const result = await createReservationAction(values)
    if (!result.ok) {
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        const message = messages[0]
        if (message && field in values) {
          setError(field as keyof CreateReservationInput, { message })
        }
      }
      toast.error(Object.values(result.fieldErrors ?? {})[0]?.[0] ?? result.message)
      return
    }
    toast.success("Reservation created.")
    router.push("/staff/reservations")
    router.refresh()
  })

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="userId">Reserved for</Label>
          <Controller
            control={control}
            name="userId"
            render={({ field }) => (
              <Select
                id="userId"
                name={field.name}
                placeholder="Choose a user"
                options={data.users.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` }))}
                value={field.value}
                onValueChange={field.onChange}
                invalid={!!errors.userId}
              />
            )}
          />
          <FieldError message={errors.userId?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="resourceId">Resource</Label>
          <Controller
            control={control}
            name="resourceId"
            render={({ field }) => (
              <Select
                id="resourceId"
                name={field.name}
                placeholder="Choose a resource"
                options={data.resources.map((r) => ({
                  value: r.id,
                  label: `${r.name} (${r.type.toLowerCase()})`,
                }))}
                value={field.value}
                onValueChange={field.onChange}
                invalid={!!errors.resourceId}
              />
            )}
          />
          <FieldError message={errors.resourceId?.message} />
        </div>
      </div>

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
        {formState.isSubmitting ? "Creating…" : "Create reservation"}
      </Button>
    </form>
  )
}
