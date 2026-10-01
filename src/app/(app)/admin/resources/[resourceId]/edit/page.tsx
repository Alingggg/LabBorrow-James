import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "../../../_components/PageHeader"
import { ResourceEditor } from "../../_components/ResourceEditor"
import { getResource } from "../../data"

export const metadata: Metadata = { title: "Edit resource" }

export default async function EditResourcePage({ params }: PageProps<"/admin/resources/[resourceId]/edit">) {
  const { resourceId } = await params
  const record = await getResource(resourceId)
  if (!record) notFound()
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin/resources" className="mb-3 inline-block text-sm text-muted-foreground">← Back to resources</Link>
      <PageHeader title="Edit resource" />
      <Card><CardContent className="p-6"><ResourceEditor resource={record} /></CardContent></Card>
    </div>
  )
}
