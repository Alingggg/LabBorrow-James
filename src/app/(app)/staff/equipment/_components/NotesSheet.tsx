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
import { notesFormSchema } from "../schemas"

export function NotesSheet({
  trigger,
  title,
  submitLabel,
  successMessage,
  onSubmit,
}: {
  trigger: ReactNode
  title: string
  submitLabel: string
  successMessage: string
  onSubmit: (values: { notes: string }) => Promise<ActionResult>
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset, formState } = useForm<z.input<typeof notesFormSchema>>({
    resolver: zodResolver(notesFormSchema),
    defaultValues: { notes: "" },
  })

  const submit = handleSubmit(async (values) => {
    const result = await onSubmit({ notes: values.notes })
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...register("notes")} />
            <FieldError message={formState.errors.notes?.message} />
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
