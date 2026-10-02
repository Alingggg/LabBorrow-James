import { redirect } from "next/navigation";

import { requireUser } from "@/data/auth";
import { homeFor, type UserRole } from "@/lib/roles";

export default async function Home() {
  const currentUser = await requireUser();

  const home = homeFor(currentUser.role as UserRole);
  if (home) redirect(home);

  return <main className="min-h-svh" />;
}
