import type { Metadata } from "next";

import { AuthForm } from "../_components/auth-form";

export const metadata: Metadata = {
  title: "Sign in | BookFlow",
  description: "Sign in to your BookFlow account.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
