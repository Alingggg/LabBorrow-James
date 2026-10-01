import { cn } from "@/lib/utils"

export function FieldError({
  id,
  message,
  className,
}: {
  id?: string
  message?: string
  className?: string
}) {
  if (!message) return null
  return (
    <p id={id} role="alert" className={cn("text-xs text-destructive", className)}>
      {message}
    </p>
  )
}
