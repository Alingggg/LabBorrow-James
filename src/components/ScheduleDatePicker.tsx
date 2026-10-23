"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { scheduleDateFormSchema, type ScheduleDateFormValues } from "@/schemas/schedule"

export function ScheduleDatePicker({ date, basePath }: { date: string; basePath: string }) {
  const router = useRouter()
  const { register, handleSubmit } = useForm<ScheduleDateFormValues>({
    resolver: zodResolver(scheduleDateFormSchema),
    defaultValues: { date },
  })

  const apply = handleSubmit((values) => router.push(`${basePath}?date=${values.date}`))

  return (
    <form onSubmit={apply} noValidate>
      <Label htmlFor="date" className="sr-only">Date</Label>
      <Input id="date" type="date" className="w-44" {...register("date", { onChange: () => void apply() })} />
    </form>
  )
}
