import type { Metadata } from "next"

import { PageHeader } from "../_components/PageHeader"
import { SchoolProfile } from "./_components/SettingsForms"
import { getSettingsPageData } from "./data"

export const metadata: Metadata = { title: "School settings" }

export default async function SettingsPage() {
  const { facility } = await getSettingsPageData()
  return (
    <div className="space-y-7">
      <PageHeader title="School settings" />
      <SchoolProfile facility={facility} />
    </div>
  )
}
