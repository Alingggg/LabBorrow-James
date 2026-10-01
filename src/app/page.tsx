import { redirect } from "next/navigation";

import { requireUser } from "@/lib/session";

export default async function Home() {
  const currentUser = await requireUser();

  if (currentUser.role === "ADMIN") redirect("/admin");

  return <main className="min-h-svh" />;
}
