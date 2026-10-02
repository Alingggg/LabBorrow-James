import { requireAdmin } from "@/data/auth"

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin()
  return children
}
