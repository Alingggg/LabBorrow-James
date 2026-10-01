"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircle, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function signOut() {
    setPending(true)
    await authClient.signOut()
    router.replace("/login")
    router.refresh()
  }

  return (
    <Button
      variant="outline"
      size={compact ? "icon-sm" : "default"}
      aria-label={compact ? "Sign out" : undefined}
      disabled={pending}
      onClick={signOut}
    >
      {pending ? (
        <LoaderCircle className="animate-spin" aria-hidden="true" />
      ) : (
        <LogOut aria-hidden="true" />
      )}
      {!compact && (pending ? "Signing out…" : "Sign out")}
    </Button>
  )
}
