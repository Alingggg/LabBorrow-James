import type { Metadata } from "next"
import { FlaskConical, ShieldCheck, UserRound } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"
import { getAdminOverview } from "./data"

export const metadata: Metadata = { title: "Administration" }

export default async function AdminPage() {
  const overview = await getAdminOverview()
  const cards = [
    ["Total resources", overview.totalResources, FlaskConical],
    ["Unavailable resources", overview.unavailableResources, ShieldCheck],
    ["Registered accounts", overview.totalAccounts, UserRound],
  ] as const

  return (
    <div className="space-y-7">
      <PageHeader title="Administration" />
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(([label, value, Icon]) => (
          <Card key={label}>
            <CardContent className="items-center gap-2 text-center">
              <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <p className="text-2xl font-semibold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Accounts by role</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Object.entries(overview.roleCounts).map(([role, total]) => (
            <div key={role} className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-semibold">{total}</p>
              <p className="mt-1 text-xs uppercase text-muted-foreground">{role.replaceAll("_", " ")}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
