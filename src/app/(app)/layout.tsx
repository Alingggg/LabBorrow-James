import { AppLayout } from "./_components/AppLayout"
import { requireUser } from "@/data/auth"
import { getInstitutionName } from "@/data/settings"

export default async function AuthenticatedLayout({
  children,
}: LayoutProps<"/">) {
  const currentUser = await requireUser()
  const institutionName = await getInstitutionName()
  return (
    <AppLayout user={currentUser} institutionName={institutionName}>
      {children}
    </AppLayout>
  )
}
