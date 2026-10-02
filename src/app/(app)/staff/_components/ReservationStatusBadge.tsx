import { Badge } from "@/components/ui/badge"
import type { ReservationStatus } from "@/lib/reservation-status"

const variants: Record<ReservationStatus, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING_APPROVAL: "secondary",
  CONFIRMED: "default",
  CHECKED_OUT: "default",
  RETURNED: "outline",
  COMPLETED: "outline",
  REJECTED: "destructive",
  CANCELLED: "outline",
}

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  return <Badge variant={variants[status]}>{status.replaceAll("_", " ")}</Badge>
}
