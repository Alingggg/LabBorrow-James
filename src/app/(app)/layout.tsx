import { eq } from "drizzle-orm"

import { AppLayout } from "./_components/AppLayout"
import { db } from "@/db"
import { facilitySettings } from "@/db/schema"
import { requireAdmin } from "@/lib/session"

export default async function AuthenticatedLayout({
  children,
}: LayoutProps<"/">) {
  const currentUser = await requireAdmin()
  const [settings] = await db
    .select({ institutionName: facilitySettings.institutionName })
    .from(facilitySettings)
    .where(eq(facilitySettings.id, "default"))
    .limit(1)
  return (
    <AppLayout user={currentUser} institutionName={settings?.institutionName ?? "LabReserve Campus"}>
      {children}
    </AppLayout>
  )
}
