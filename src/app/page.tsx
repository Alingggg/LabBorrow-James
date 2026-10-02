import { redirect } from "next/navigation";

import { requireUser } from "@/data/auth";

export default async function Home() {
  const currentUser = await requireUser();

  if (currentUser.role === "ADMIN") redirect("/admin");
  if (currentUser.role === "RESOURCE_STAFF") redirect("/staff");

  return <main className="min-h-svh" />;
}
