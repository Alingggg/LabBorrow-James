"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Select } from "@/components/Select"
import { Button } from "@/components/ui/button"
import { roleOptions } from "@/lib/role-options"
import { updateUserRoleAction } from "../actions"
import { roleInputSchema, type CreateUserInput } from "../zod-schemas"
import type { z } from "zod"

export function UserRoleForm({ userId, role }: { userId: string; role: CreateUserInput["role"] }) {
  const router = useRouter()
  const form = useForm<z.input<typeof roleInputSchema>, unknown, z.output<typeof roleInputSchema>>({
    resolver: zodResolver(roleInputSchema),
    defaultValues: { userId, role },
  })
  const { control, handleSubmit, formState } = form

  const onSubmit = handleSubmit(async (values) => {
    const result = await updateUserRoleAction(values)
    if (!result.ok) {
      toast.error(Object.values(result.fieldErrors ?? {})[0]?.[0] ?? result.message)
      return
    }
    toast.success("Role updated.")
    router.refresh()
  })

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2" noValidate>
      <Controller
        control={control}
        name="role"
        render={({ field }) => (
          <Select
            id={`role-${userId}`}
            name={field.name}
            options={roleOptions}
            value={field.value ?? ""}
            onValueChange={field.onChange}
            className="w-44"
            invalid={!!formState.errors.role}
          />
        )}
      />
      <Button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting && <LoaderCircle className="animate-spin" aria-hidden="true" />}
        {formState.isSubmitting ? "Saving…" : "Update"}
      </Button>
    </form>
  )
}
