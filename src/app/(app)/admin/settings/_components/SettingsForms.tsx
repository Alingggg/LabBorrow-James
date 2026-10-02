"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LoaderCircle, Pencil } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { cn } from "cn"

import { FieldError } from "@/components/FieldError"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateFacilityAction } from "../actions"
import { facilityInputSchema, type FacilityInput } from "../schemas"
import type { z } from "zod"

const facilityFields: { name: keyof FacilityInput; label: string; type?: string; wide?: boolean }[] = [
  { name: "institutionName", label: "Institution name" },
  { name: "email", label: "Contact email", type: "email" },
  { name: "phone", label: "Phone" },
  { name: "address", label: "Address", wide: true },
]

export function SchoolProfile({ facility }: { facility: FacilityInput }) {
  const [editing, setEditing] = useState(false)

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <CardTitle>School profile</CardTitle>
        {!editing && (
          <Button type="button" variant="outline" onClick={() => setEditing(true)}>
            <Pencil aria-hidden="true" />
            Edit profile
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editing ? (
          <FacilityForm facility={facility} onDone={() => setEditing(false)} />
        ) : (
          <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {facilityFields.map(({ name, label, wide }) => (
              <div key={name} className={cn("space-y-1", wide && "sm:col-span-2 lg:col-span-3")}>
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="text-sm font-medium">{facility[name] || "—"}</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  )
}

function FacilityForm({ facility, onDone }: { facility: FacilityInput; onDone: () => void }) {
  const router = useRouter()
  const form = useForm<FacilityInput, unknown, z.output<typeof facilityInputSchema>>({
    resolver: zodResolver(facilityInputSchema),
    defaultValues: facility,
  })
  const { register, handleSubmit, formState } = form

  const onSubmit = handleSubmit(async (values) => {
    const result = await updateFacilityAction(values)
    if (!result.ok) {
      toast.error(Object.values(result.fieldErrors ?? {})[0]?.[0] ?? result.message)
      return
    }
    toast.success("Changes saved.")
    router.refresh()
    onDone()
  })

  return (
    <form onSubmit={onSubmit} className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3" noValidate>
      {facilityFields.map(({ name, label, type, wide }) => {
        const error = formState.errors[name]?.message
        return (
          <div key={name} className={cn("space-y-2", wide && "sm:col-span-2 lg:col-span-3")}>
            <Label htmlFor={name}>{label}</Label>
            <Input
              id={name}
              type={type}
              aria-invalid={!!error}
              aria-describedby={error ? `${name}-error` : undefined}
              {...register(name)}
            />
            <FieldError id={`${name}-error`} message={error} />
          </div>
        )
      })}
      <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting && <LoaderCircle className="animate-spin" aria-hidden="true" />}
          {formState.isSubmitting ? "Saving…" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={onDone} disabled={formState.isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
