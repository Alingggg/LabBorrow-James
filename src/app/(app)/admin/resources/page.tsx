import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "../_components/PageHeader"
import { ResourceStatusBadge } from "../_components/ResourceStatusBadge"
import { listResources } from "./data"

export const metadata: Metadata = { title: "Manage resources" }

export default async function AdminResourcesPage() {
  const records = await listResources()
  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="Resources" />
        <Button asChild><Link href="/admin/resources/new"><Plus /> Add resource</Link></Button>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              {["Name", "Type", "Status"].map((label) => (
                <TableHead key={label} className="h-11 px-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</TableHead>
              ))}
              <TableHead className="h-11 px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell><ResourceStatusBadge status={item.status} /></TableCell>
                <TableCell className="text-right"><Link href={`/admin/resources/${item.id}/edit`} className="text-sm font-medium hover:underline">Edit</Link></TableCell>
              </TableRow>
            ))}
            {!records.length && <TableRow><TableCell colSpan={4} className="h-28 text-center text-muted-foreground">No resources yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
