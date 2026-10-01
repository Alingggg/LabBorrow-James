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
import { roleOptions } from "@/lib/role-options"
import { createUserAction } from "../actions"
import { createUserInputSchema, type CreateUserInput } from "../zod-schemas"
import type { z } from "zod"

export function CreateUserForm({ onCreated }: { onCreated: () => void }) {
  const router = useRouter()
  const form = useForm<CreateUserInput, unknown, z.output<typeof createUserInputSchema>>({
    resolver: zodResolver(createUserInputSchema),
    defaultValues: { name: "", email: "", password: "", role: "STUDENT" },
  })
  const { register, control, handleSubmit, reset, formState } = form
  const { errors } = formState

  const onSubmit = handleSubmit(async (values) => {
    const result = await createUserAction(values)
    if (!result.ok) {
      toast.error(Object.values(result.fieldErrors ?? {})[0]?.[0] ?? result.message)
      return
    }
    toast.success("Account created.")
    reset()
    router.refresh()
    onCreated()
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="new-user-name">Name</Label>
        <Input
          id="new-user-name"
          autoComplete="off"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "new-user-name-error" : undefined}
          {...register("name")}
        />
        <FieldError id="new-user-name-error" message={errors.name?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-user-email">Email</Label>
        <Input
          id="new-user-email"
          type="email"
          autoComplete="off"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "new-user-email-error" : undefined}
          {...register("email")}
        />
        <FieldError id="new-user-email-error" message={errors.email?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-user-password">Temporary password</Label>
        <Input
          id="new-user-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "new-user-password-error" : undefined}
          {...register("password")}
        />
        <FieldError id="new-user-password-error" message={errors.password?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-user-role">Role</Label>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <Select
              id="new-user-role"
              name={field.name}
              options={roleOptions}
              value={field.value ?? ""}
              onValueChange={field.onChange}
              invalid={!!errors.role}
            />
          )}
        />
        <FieldError id="new-user-role-error" message={errors.role?.message} />
      </div>
      <div>
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting && <LoaderCircle className="animate-spin" aria-hidden="true" />}
          {formState.isSubmitting ? "Creating…" : "Create account"}
        </Button>
      </div>
    </form>
  )
}
