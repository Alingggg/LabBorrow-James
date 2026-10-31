import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LinkTabs } from "@/components/LinkTabs"
import { PageHeader } from "@/components/PageHeader"
import { ReservationStatusBadge } from "@/components/ReservationStatusBadge"
import { CancelReservationButton } from "./_components/CancelReservationButton"
import { getMyReservations } from "./data"

export const metadata: Metadata = { title: "My reservations" }

const tabs = [
  { value: "upcoming", label: "Upcoming" },
  { value: "previous", label: "Previous" },
] as const

export default async function MyReservationsPage({ searchParams }: PageProps<"/reservations">) {
  const { view: rawView } = await searchParams
  const view = rawView === "previous" ? "previous" : "upcoming"
  const rows = await getMyReservations(view)

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="My reservations" />
        <Button asChild><Link href="/resources"><Plus /> New request</Link></Button>
      </div>

      <LinkTabs
        label="Reservation period"
        tabs={tabs.map((item) => ({
          href: `/reservations?view=${item.value}`,
          label: item.label,
          active: view === item.value,
        }))}
      />

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              {["Resource", "When", "Purpose", "Status"].map((label) => (
                <TableHead key={label} className="h-11 px-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</TableHead>
              ))}
              <TableHead className="h-11 px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.resourceName}</TableCell>
                <TableCell className="whitespace-nowrap">{item.when}</TableCell>
                <TableCell className="max-w-xs truncate">{item.purpose}</TableCell>
                <TableCell>
                  <ReservationStatusBadge status={item.status} />
                  {item.rejectionReason && <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">{item.rejectionReason}</p>}
                </TableCell>
                <TableCell className="text-right">
                  {item.canCancel && <CancelReservationButton reservationId={item.id} />}
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                  {view === "upcoming" ? "No upcoming reservations." : "No previous reservations."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
