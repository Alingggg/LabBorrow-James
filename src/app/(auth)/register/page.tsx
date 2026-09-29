import type { Metadata } from "next"

import { AuthForm } from "../_components/auth-form"

export const metadata: Metadata = {
  title: "Create account | BookFlow",
  description: "Create your BookFlow account.",
}

export default function RegisterPage() {
  return <AuthForm mode="register" />
}
