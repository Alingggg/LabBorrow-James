import type { Metadata } from "next"
import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"
import { BookingForm } from "../../_components/BookingForm"
import { getBookingFormData } from "../../data"

export const metadata: Metadata = { title: "New reservation" }

export default async function NewReservationPage() {
  const data = await getBookingFormData()
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/staff/reservations" className="mb-3 inline-block text-sm text-muted-foreground">← Back to reservations</Link>
      <PageHeader title="New reservation" />
      <Card><CardContent className="p-6"><BookingForm data={data} /></CardContent></Card>
    </div>
  )
}
