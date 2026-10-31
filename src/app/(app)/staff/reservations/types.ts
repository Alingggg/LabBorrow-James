import type { ResourceType } from "@/lib/resources"

export type BookingFormData = {
  users: { id: string; name: string; email: string }[]
  resources: { id: string; name: string; type: ResourceType }[]
}
