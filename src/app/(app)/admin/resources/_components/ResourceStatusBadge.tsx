import { Badge } from "@/components/ui/badge"
import type { ResourceStatus } from "@/lib/resources"

export function ResourceStatusBadge({ status }: { status: ResourceStatus }) {
  const variant = status === "AVAILABLE" ? "default" : status === "RETIRED" ? "outline" : "secondary"
  return <Badge variant={variant}>{status.replaceAll("_", " ")}</Badge>
}
