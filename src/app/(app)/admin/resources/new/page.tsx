import type { Metadata } from "next"
import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"
import { ResourceEditor } from "../_components/ResourceEditor"

export const metadata: Metadata = { title: "Add resource" }

export default function NewResourcePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin/resources" className="mb-3 inline-block text-sm text-muted-foreground">← Back to resources</Link>
      <PageHeader title="Add resource" />
      <Card><CardContent className="p-6"><ResourceEditor /></CardContent></Card>
    </div>
  )
}
