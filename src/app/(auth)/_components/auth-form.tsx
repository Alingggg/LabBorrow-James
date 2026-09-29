"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CalendarCheck2, LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

type AuthFormProps = {
  mode: "login" | "register"
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState("")
  const isLogin = mode === "login"

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsPending(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")

    try {
      const result = isLogin
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({
            name: String(formData.get("name") ?? "").trim(),
            email,
            password,
          })

      if (result.error) {
        setError(result.error.message ?? "Something went wrong. Please try again.")
        return
      }

      router.replace("/")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mx-auto mb-6 flex w-fit items-center gap-2 text-sm font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CalendarCheck2 className="size-4" aria-hidden="true" />
          </span>
          BookFlow
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>
              <h1 className="text-xl font-semibold">
                {isLogin ? "Welcome back" : "Create your account"}
              </h1>
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Enter your details to sign in."
                : "Start managing your bookings in minutes."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Jane Smith"
                    autoComplete="name"
                    required
                    disabled={isPending}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  minLength={isLogin ? undefined : 8}
                  required
                  disabled={isPending}
                />
                {!isLogin && (
                  <p className="text-xs text-muted-foreground">
                    Use at least 8 characters.
                  </p>
                )}
              </div>

              {error && (
                <p
                  role="alert"
                  aria-live="polite"
                  className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                )}
                {isPending
                  ? isLogin
                    ? "Signing in..."
                    : "Creating account..."
                  : isLogin
                    ? "Sign in"
                    : "Create account"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t text-sm text-muted-foreground">
            {isLogin ? "New to BookFlow?" : "Already have an account?"}
            <Link
              href={isLogin ? "/register" : "/login"}
              className="ml-1 font-medium text-foreground underline-offset-4 hover:underline"
            >
              {isLogin ? "Create an account" : "Sign in"}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
