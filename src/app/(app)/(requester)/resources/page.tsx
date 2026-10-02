import type { Metadata } from "next"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LinkTabs } from "@/components/LinkTabs"
import { PageHeader } from "@/components/PageHeader"
import { accessScopeLabels } from "@/lib/resources"
import { listCatalog } from "./data"

export const metadata: Metadata = { title: "Resources" }

const tabs = [
  { value: "rooms", label: "Rooms" },
  { value: "equipment", label: "Equipment" },
] as const

export default async function ResourcesPage({ searchParams }: PageProps<"/resources">) {
  const { type } = await searchParams
  const tab = type === "equipment" ? "equipment" : "rooms"
  const items = await listCatalog(tab === "equipment" ? "EQUIPMENT" : "ROOM")

  return (
    <div className="space-y-7">
      <PageHeader title="Resources" />
      <LinkTabs
        label="Resource type"
        tabs={tabs.map((item) => ({
          href: `/resources?type=${item.value}`,
          label: item.label,
          active: tab === item.value,
        }))}
      />
      {items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/resources/${item.id}`}
              className="rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Card className="h-full transition-colors hover:bg-muted/40">
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                  {item.accessScope === "FACULTY_STAFF" && (
                    <CardAction><Badge variant="secondary">{accessScopeLabels.FACULTY_STAFF}</Badge></CardAction>
                  )}
                  {item.description && <CardDescription className="line-clamp-2">{item.description}</CardDescription>}
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border bg-card py-12 text-center text-sm text-muted-foreground">
          No {tab === "equipment" ? "equipment" : "rooms"} available.
        </p>
      )}
    </div>
  )
}
