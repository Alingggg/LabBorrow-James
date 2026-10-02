import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { Failure } from "@/lib/action-helpers";
import { auth } from "@/lib/auth";
import type { Actor } from "@/data/reservations";
import { isStaffRole, type UserRole } from "@/lib/roles";

export type SessionUser = typeof auth.$Infer.Session.user;

export const getCurrentUser = cache(async () => {
  const currentSession = await auth.api.getSession({
    headers: await headers(),
  });
  return currentSession?.user ?? null;
});

export async function requireUser() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  return currentUser;
}

export async function requireAdmin() {
  const currentUser = await requireUser();
  if (currentUser.role !== "ADMIN") redirect("/");
  return currentUser;
}

export async function authorizeAdmin(): Promise<{ actor: Actor } | { failure: Failure }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { failure: { ok: false, code: "UNAUTHORIZED", message: "Sign in to continue." } };
  }
  if (currentUser.role !== "ADMIN") {
    return {
      failure: { ok: false, code: "FORBIDDEN", message: "Administrator access is required." },
    };
  }
  return { actor: { id: currentUser.id, role: currentUser.role as UserRole } };
}

export async function authorizeStaff(): Promise<{ actor: Actor } | { failure: Failure }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { failure: { ok: false, code: "UNAUTHORIZED", message: "Sign in to continue." } };
  }
  if (!isStaffRole(currentUser.role as UserRole)) {
    return {
      failure: { ok: false, code: "FORBIDDEN", message: "Resource staff access is required." },
    };
  }
  return { actor: { id: currentUser.id, role: currentUser.role as UserRole } };
}

export async function requireStaff() {
  const currentUser = await requireUser();
  if (!isStaffRole(currentUser.role as UserRole)) redirect("/");
  return currentUser;
}
