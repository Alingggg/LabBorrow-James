import { requireStaff } from "@/data/auth"

export default async function StaffLayout({ children }: LayoutProps<"/staff">) {
  await requireStaff()
  return children
}
