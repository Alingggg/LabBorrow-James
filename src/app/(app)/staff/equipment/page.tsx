import type { Metadata } from "next"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/PageHeader"
import { CheckoutButton, ReturnButton } from "../_components/EquipmentActions"
import { CompleteButton } from "../_components/ReservationActions"
import { getEquipmentWork } from "../data"
import type { EquipmentRow } from "../types"

export const metadata: Metadata = { title: "Equipment" }

function EquipmentTable({
  title,
  rows,
  emptyText,
  action,
}: {
  title: string
  rows: EquipmentRow[]
  emptyText: string
  action: (row: EquipmentRow) => React.ReactNode
}) {
  const heads = ["Equipment", "Reserved for", "When"]
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              {heads.map((label) => (
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
                <TableCell className="text-right">{action(item)}</TableCell>
              </TableRow>
            ))}
            {!rows.length && <TableRow><TableCell colSpan={heads.length + 1} className="h-24 text-center text-muted-foreground">{emptyText}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

export default async function EquipmentPage() {
  const { readyForCheckout, checkedOut } = await getEquipmentWork()
  return (
    <div className="space-y-7">
      <PageHeader title="Equipment" />
      <EquipmentTable
        title="Ready for checkout"
        rows={readyForCheckout}
        emptyText="No confirmed equipment reservations."
        action={(row) =>
          row.canComplete ? <CompleteButton reservationId={row.id} /> : <CheckoutButton reservationId={row.id} />
        }
      />
      <EquipmentTable
        title="Checked out"
        rows={checkedOut}
        emptyText="Nothing is checked out."
        action={(row) => <ReturnButton reservationId={row.id} />}
      />
    </div>
  )
}
