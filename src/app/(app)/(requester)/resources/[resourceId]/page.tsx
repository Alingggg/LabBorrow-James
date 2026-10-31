import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"
import { ReservationStatusBadge } from "@/components/ReservationStatusBadge"
import { getOperatingHours } from "@/data/settings"
import { accessScopeLabels, formatMaxDuration } from "@/lib/resources"
import { getResource } from "../data"
import { RequestForm } from "./_components/RequestForm"

export const metadata: Metadata = { title: "Request resource" }

export default async function ResourcePage({ params }: PageProps<"/resources/[resourceId]">) {
  const { resourceId } = await params
  const [resource, hours] = await Promise.all([getResource(resourceId), getOperatingHours()])
  if (!resource) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/resources?type=${resource.type === "EQUIPMENT" ? "equipment" : "rooms"}`}
          className="mb-3 inline-block text-sm text-muted-foreground"
        >
          ← Back to resources
        </Link>
        <PageHeader title={resource.name} />
        {resource.accessScope === "FACULTY_STAFF" && (
          <Badge variant="secondary" className="mt-2">{accessScopeLabels.FACULTY_STAFF}</Badge>
        )}
        {resource.description && <p className="mt-4 max-w-3xl whitespace-pre-line">{resource.description}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Booked</CardTitle></CardHeader>
            <CardContent>
              {resource.booked.length ? (
                <ul className="space-y-2 text-sm">
                  {resource.booked.map((slot) => (
                    <li key={slot.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg border px-3 py-2">
                      <span>{slot.when}</span>
                      <ReservationStatusBadge status={slot.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming bookings.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Booking rules</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>Up to {formatMaxDuration(resource.maxReservationMinutes)} per reservation</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
                {hours.map((day) => (
                  <div key={day.weekday} className="contents">
                    <dt className="text-muted-foreground">{day.label}</dt>
                    <dd>{day.hours ?? "Closed"}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>
        <Card className="self-start">
          <CardHeader><CardTitle>Request this resource</CardTitle></CardHeader>
          <CardContent><RequestForm resourceId={resource.id} /></CardContent>
        </Card>
      </div>
    </div>
  )
}
