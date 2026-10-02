import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { Failure } from "@/lib/action-helpers";
import { auth } from "@/lib/auth";
import type { Actor } from "@/data/reservations";
import { isRequesterRole, isStaffRole, type UserRole } from "@/lib/roles";

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

async function authorizeWith(
  allowed: (role: UserRole) => boolean,
  forbiddenMessage: string
): Promise<{ actor: Actor } | { failure: Failure }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { failure: { ok: false, code: "UNAUTHORIZED", message: "Sign in to continue." } };
  }
  const role = currentUser.role as UserRole;
  if (!allowed(role)) {
    return { failure: { ok: false, code: "FORBIDDEN", message: forbiddenMessage } };
  }
  return { actor: { id: currentUser.id, role } };
}

export function authorizeAdmin() {
  return authorizeWith((role) => role === "ADMIN", "Administrator access is required.");
}

export function authorizeStaff() {
  return authorizeWith(isStaffRole, "Resource staff access is required.");
}

export function authorizeRequester() {
  return authorizeWith(isRequesterRole, "You can't make reservation requests.");
}

export async function requireStaff() {
  const currentUser = await requireUser();
  if (!isStaffRole(currentUser.role as UserRole)) redirect("/");
  return currentUser;
}

export async function requireRequester() {
  const currentUser = await requireUser();
  if (!isRequesterRole(currentUser.role as UserRole)) redirect("/");
  return currentUser;
}
