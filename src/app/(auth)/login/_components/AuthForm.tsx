"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, Microscope } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSyncExternalStore } from "react";

import { FieldError } from "@/components/FieldError";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { loginSchema, type LoginValues } from "../_lib/zod-schemas";

const subscribeToHydration = () => () => undefined;

export function AuthForm() {
  const router = useRouter();
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginValues>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const submit = handleSubmit(async (values) => {
    try {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (result.error) {
        setError("root.server", {
          message:
            result.error.message ?? "Something went wrong. Please try again.",
        });
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("root.server", {
        message: "Something went wrong. Please try again.",
      });
    }
  });

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mx-auto mb-6 flex w-fit items-center gap-2 text-sm font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Microscope className="size-4" aria-hidden="true" />
          </span>
          LabReserve
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>
              <h1 className="text-xl font-semibold">Welcome back</h1>
            </CardTitle>
            <CardDescription>
              Enter your details to sign in. Accounts are created by an
              administrator.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={submit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={!isHydrated || isSubmitting}
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
                <FieldError message={errors.email?.message} className="text-sm" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  disabled={!isHydrated || isSubmitting}
                  aria-invalid={Boolean(errors.password)}
                  {...register("password")}
                />
                <FieldError message={errors.password?.message} className="text-sm" />
              </div>

              {errors.root?.server?.message && (
                <p
                  role="alert"
                  aria-live="polite"
                  className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {errors.root.server.message}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={!isHydrated || isSubmitting}
              >
                {isSubmitting && (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                )}
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
