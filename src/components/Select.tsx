"use client"

import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type SelectOption = { value: string; label: string }

export function Select({
  id,
  name,
  options,
  value,
  onValueChange,
  defaultValue,
  placeholder,
  className,
  invalid,
}: {
  id?: string
  name: string
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  placeholder?: string
  className?: string
  invalid?: boolean
}) {
  const controlled = onValueChange
    ? { value: value ?? "", onValueChange }
    : { defaultValue: defaultValue || undefined }
  return (
    <SelectRoot name={name} required {...controlled}>
      <SelectTrigger id={id} aria-invalid={invalid || undefined} className={className ?? "w-full"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  )
}
