import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LinkTabs } from "@/components/LinkTabs"
import { PageHeader } from "@/components/PageHeader"
import { ReservationStatusBadge } from "@/components/ReservationStatusBadge"
import { CancelButton } from "../_components/ReservationActions"
import { ReservationFilters } from "../_components/ReservationFilters"
import { listReservations } from "../data"

export const metadata: Metadata = { title: "Reservations" }

const tabs = [
  { value: "rooms", label: "Rooms" },
  { value: "equipment", label: "Equipment" },
] as const

export default async function ReservationsPage({ searchParams }: PageProps<"/staff/reservations">) {
  const params = await searchParams
  const single = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)
  const tab = single(params.type) === "equipment" ? "equipment" : "rooms"
  const { rows, filters, resourceOptions } = await listReservations({
    type: tab === "equipment" ? "EQUIPMENT" : "ROOM",
    status: single(params.status),
    resourceId: single(params.resourceId),
  })

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="Reservations" />
        <Button asChild><Link href="/staff/reservations/new"><Plus /> New reservation</Link></Button>
      </div>

      <LinkTabs
        label="Resource type"
        tabs={tabs.map((item) => ({
          href: `/staff/reservations?type=${item.value}`,
          label: item.label,
          active: tab === item.value,
        }))}
      />

      <ReservationFilters
        key={`${tab}-${filters.status ?? ""}-${filters.resourceId ?? ""}`}
        type={tab}
        status={filters.status}
        resourceId={filters.resourceId}
        resources={resourceOptions}
      />

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              {["Resource", "Reserved for", "When", "Status"].map((label) => (
                <TableHead key={label} className="h-11 px-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</TableHead>
              ))}
              <TableHead className="h-11 px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.resourceName}</TableCell>
                <TableCell>{item.requesterName}</TableCell>
                <TableCell className="whitespace-nowrap">{item.when}</TableCell>
                <TableCell>
                  <ReservationStatusBadge status={item.status} />
                  {item.rejectionReason && <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">{item.rejectionReason}</p>}
                </TableCell>
                <TableCell className="text-right">
                  {(item.status === "PENDING_APPROVAL" || item.status === "CONFIRMED") && (
                    <CancelButton reservationId={item.id} />
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && <TableRow><TableCell colSpan={5} className="h-28 text-center text-muted-foreground">No reservations found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
