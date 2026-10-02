"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { FieldError } from "@/components/FieldError"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import type { ActionResult } from "@/types/action-result"
import { optionalReasonFormSchema, requiredReasonFormSchema } from "@/schemas/reservations"

export function ReasonSheet({
  trigger,
  title,
  label,
  required,
  submitLabel,
  successMessage,
  onSubmit,
}: {
  trigger: ReactNode
  title: string
  label: string
  required: boolean
  submitLabel: string
  successMessage: string
  onSubmit: (reason: string) => Promise<ActionResult>
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const schema = required ? requiredReasonFormSchema : optionalReasonFormSchema
  const { register, handleSubmit, reset, formState } = useForm<z.input<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "" },
  })

  const submit = handleSubmit(async ({ reason }) => {
    const result = await onSubmit(reason)
    if (!result.ok) {
      toast.error(Object.values(result.fieldErrors ?? {})[0]?.[0] ?? result.message)
      return
    }
    toast.success(successMessage)
    reset()
    setOpen(false)
    router.refresh()
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <form onSubmit={submit} className="space-y-4 px-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="reason">{label}</Label>
            <Textarea
              id="reason"
              rows={4}
              aria-invalid={!!formState.errors.reason}
              aria-describedby={formState.errors.reason ? "reason-error" : undefined}
              {...register("reason")}
            />
            <FieldError id="reason-error" message={formState.errors.reason?.message} />
          </div>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting && <LoaderCircle className="animate-spin" aria-hidden="true" />}
            {submitLabel}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
