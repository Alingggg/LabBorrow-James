"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"

import { Select } from "@/components/Select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { reservationStatuses } from "@/lib/reservation-status"
import {
  ALL_FILTER,
  reservationFilterFormSchema,
  type ReservationFilterFormValues,
} from "../schemas"

export function ReservationFilters({
  type,
  status,
  resourceId,
  resources,
}: {
  type: "rooms" | "equipment"
  status?: string
  resourceId?: string
  resources: { id: string; name: string }[]
}) {
  const router = useRouter()
  const { control, handleSubmit } = useForm<ReservationFilterFormValues>({
    resolver: zodResolver(reservationFilterFormSchema),
    defaultValues: {
      status: (status as ReservationFilterFormValues["status"] | undefined) ?? ALL_FILTER,
      resourceId: resourceId ?? ALL_FILTER,
    },
  })

  const apply = handleSubmit((values) => {
    const params = new URLSearchParams({ type })
    if (values.status !== ALL_FILTER) params.set("status", values.status)
    if (values.resourceId !== ALL_FILTER) params.set("resourceId", values.resourceId)
    router.push(`/staff/reservations?${params}`)
  })

  return (
    <form onSubmit={apply} className="flex flex-wrap items-end gap-3" noValidate>
      <div className="space-y-1">
        <Label htmlFor="status" className="text-xs text-muted-foreground">Status</Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select
              id="status"
              name={field.name}
              className="w-48"
              options={[
                { value: ALL_FILTER, label: "All statuses" },
                ...reservationStatuses.map((s) => ({ value: s, label: s.replaceAll("_", " ") })),
              ]}
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value)
                void apply()
              }}
            />
          )}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="resourceId" className="text-xs text-muted-foreground">Resource</Label>
        <Controller
          control={control}
          name="resourceId"
          render={({ field }) => (
            <Select
              id="resourceId"
              name={field.name}
              className="w-56"
              options={[
                { value: ALL_FILTER, label: "All resources" },
                ...resources.map((r) => ({ value: r.id, label: r.name })),
              ]}
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value)
                void apply()
              }}
            />
          )}
        />
      </div>
      {(status || resourceId) && (
        <Button asChild variant="ghost"><Link href={`/staff/reservations?type=${type}`}>Clear</Link></Button>
      )}
    </form>
  )
}
