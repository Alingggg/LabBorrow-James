import type { Metadata } from "next"

import { AuthForm } from "./_components/AuthForm"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your LabBorrow James account.",
}

export default function LoginPage() {
  return <AuthForm />
}
