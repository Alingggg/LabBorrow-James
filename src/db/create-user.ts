import { hashPassword } from "better-auth/crypto";

import { db } from "@/db";
import { account, user } from "@/db/schema";
import type { UserRole } from "@/lib/roles";

// Outside data/ so the Bun create-admin script can import it (no server-only).
export type NewUser = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export async function createUser(newUser: NewUser) {
  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(newUser.password);

  await db.transaction(async (tx) => {
    await tx.insert(user).values({
      id,
      name: newUser.name,
      email: newUser.email.toLowerCase(),
      emailVerified: true,
      role: newUser.role,
    });
    await tx.insert(account).values({
      id: crypto.randomUUID(),
      accountId: id,
      providerId: "credential",
      userId: id,
      password: passwordHash,
    });
  });

  return { id };
}
