"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { FieldError } from "@/components/FieldError"
import { Select } from "@/components/Select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { accessScopeLabels, accessScopes } from "@/lib/resources"
import type { ResourceSummary } from "../types"
import { saveResourceAction } from "../actions"
import { resourceInputSchema, type ResourceInput, type ResourceOutput } from "../schemas"

const typeOptions = [
  { value: "ROOM", label: "Room" },
  { value: "EQUIPMENT", label: "Equipment" },
]

const statusOptions = [
  { value: "AVAILABLE", label: "Available" },
  { value: "UNAVAILABLE", label: "Unavailable" },
  { value: "RETIRED", label: "Retired" },
]

const accessOptions = accessScopes.map((scope) => ({ value: scope, label: accessScopeLabels[scope] }))

export function ResourceEditor({ resource }: { resource?: ResourceSummary }) {
  const router = useRouter()
  const form = useForm<ResourceInput, unknown, ResourceOutput>({
    resolver: zodResolver(resourceInputSchema),
    defaultValues: {
      id: resource?.id ?? "",
      name: resource?.name ?? "",
      description: resource?.description ?? "",
      type: resource?.type ?? "ROOM",
      status: resource?.status ?? "AVAILABLE",
      accessScope: resource?.accessScope ?? "ALL_USERS",
      maxReservationMinutes: resource?.maxReservationMinutes ?? 120,
    },
  })
  const { register, control, handleSubmit, formState } = form
  const { errors } = formState

  const onSubmit = handleSubmit(async (values) => {
    const result = await saveResourceAction(values)
    if (!result.ok) {
      toast.error(Object.values(result.fieldErrors ?? {})[0]?.[0] ?? result.message)
      return
    }
    toast.success("Resource saved.")
    router.push("/admin/resources")
    router.refresh()
  })

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name")}
        />
        <FieldError id="name-error" message={errors.name?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? "description-error" : undefined}
          {...register("description")}
        />
        <FieldError id="description-error" message={errors.description?.message} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select
                id="type"
                name={field.name}
                options={typeOptions}
                value={field.value ?? ""}
                onValueChange={field.onChange}
                invalid={!!errors.type}
              />
            )}
          />
          <FieldError id="type-error" message={errors.type?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                id="status"
                name={field.name}
                options={statusOptions}
                value={field.value ?? ""}
                onValueChange={field.onChange}
                invalid={!!errors.status}
              />
            )}
          />
          <FieldError id="status-error" message={errors.status?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accessScope">Access</Label>
          <Controller
            control={control}
            name="accessScope"
            render={({ field }) => (
              <Select
                id="accessScope"
                name={field.name}
                options={accessOptions}
                value={field.value ?? ""}
                onValueChange={field.onChange}
                invalid={!!errors.accessScope}
              />
            )}
          />
          <FieldError id="accessScope-error" message={errors.accessScope?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxReservationMinutes">Max duration (minutes)</Label>
          <Input
            id="maxReservationMinutes"
            type="number"
            min={1}
            max={1440}
            step={1}
            aria-invalid={!!errors.maxReservationMinutes}
            aria-describedby={errors.maxReservationMinutes ? "maxReservationMinutes-error" : undefined}
            {...register("maxReservationMinutes", { valueAsNumber: true })}
          />
          <FieldError id="maxReservationMinutes-error" message={errors.maxReservationMinutes?.message} />
        </div>
      </div>
      <Button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting && <LoaderCircle className="animate-spin" aria-hidden="true" />}
        {formState.isSubmitting ? "Saving resource…" : resource ? "Save resource" : "Create resource"}
      </Button>
    </form>
  )
}
