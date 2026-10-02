import { requireRequester } from "@/data/auth"

export default async function RequesterLayout({ children }: LayoutProps<"/">) {
  await requireRequester()
  return children
}
