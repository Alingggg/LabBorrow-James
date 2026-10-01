import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { Table,TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "../_components/PageHeader"
import { CreateUserSheet } from "./_components/CreateUserSheet"
import { UserRoleForm } from "./_components/UserRoleForm"
import { listUsers } from "./data"

export const metadata: Metadata = { title: "Users and roles" }

export default async function UsersPage() {
  const { currentUser, users } = await listUsers()
  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between gap-4">
        <PageHeader title="Users and roles" />
        <CreateUserSheet />
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              {["User", "Current role", "Change role"].map((label) => (
                <TableHead key={label} className="h-11 px-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((item) => (
              <TableRow key={item.id}>
                <TableCell><p className="font-medium">{item.name}{item.id === currentUser.id ? " (you)" : ""}</p><p className="text-xs text-muted-foreground">{item.email}</p></TableCell>
                <TableCell><Badge variant="outline">{item.role.replaceAll("_", " ")}</Badge></TableCell>
                <TableCell>
                  <UserRoleForm userId={item.id} role={item.role} />
                </TableCell>
              </TableRow>
            ))}
            {!users.length && <TableRow><TableCell colSpan={3} className="h-28 text-center text-muted-foreground">No registered accounts.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
