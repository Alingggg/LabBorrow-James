import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export type SessionUser = typeof auth.$Infer.Session.user;

export const getSessionUser = cache(async () => {
  const currentSession = await auth.api.getSession({
    headers: await headers(),
  });
  return currentSession?.user ?? null;
});

export async function requireUser() {
  const currentUser = await getSessionUser();
  if (!currentUser) redirect("/login");
  return currentUser;
}

export async function requireAdmin() {
  const currentUser = await requireUser();
  if (currentUser.role !== "ADMIN") redirect("/");
  return currentUser;
}
