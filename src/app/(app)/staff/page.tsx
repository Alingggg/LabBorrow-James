import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/PageHeader"
import { ApproveButton, RejectButton } from "./_components/ReservationActions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPendingReservations } from "./data"

export const metadata: Metadata = { title: "Pending requests" }

export default async function PendingRequestsPage() {
  const requests = await getPendingReservations()
  return (
    <div className="space-y-7">
      <PageHeader title="Pending requests" />
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              {["Resource", "Requested by", "When", "Purpose"].map((label) => (
                <TableHead key={label} className="h-11 px-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</TableHead>
              ))}
              <TableHead className="h-11 px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.resourceName}</TableCell>
                <TableCell>{item.requesterName}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {item.when}
                  {item.ended && <Badge variant="outline" className="ml-2">Time passed</Badge>}
                </TableCell>
                <TableCell className="max-w-xs truncate">{item.purpose}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {!item.ended && <ApproveButton reservationId={item.id} />}
                    <RejectButton reservationId={item.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!requests.length && <TableRow><TableCell colSpan={5} className="h-28 text-center text-muted-foreground">No pending requests.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
