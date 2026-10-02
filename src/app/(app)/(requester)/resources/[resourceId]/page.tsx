import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"
import { accessScopeLabels } from "@/lib/resources"
import { getCatalogResource } from "../data"
import { RequestForm } from "./_components/RequestForm"

export const metadata: Metadata = { title: "Request resource" }

export default async function ResourcePage({ params }: PageProps<"/resources/[resourceId]">) {
  const { resourceId } = await params
  const found = await getCatalogResource(resourceId)
  if (!found) notFound()
  const { resource, booked } = found

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
        <Card>
          <CardHeader><CardTitle>Booked</CardTitle></CardHeader>
          <CardContent>
            {booked.length ? (
              <ul className="space-y-2 text-sm">
                {booked.map((slot) => (
                  <li key={slot.id} className="rounded-lg border px-3 py-2">{slot.when}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming bookings.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Request this resource</CardTitle></CardHeader>
          <CardContent><RequestForm resourceId={resource.id} /></CardContent>
        </Card>
      </div>
    </div>
  )
}
