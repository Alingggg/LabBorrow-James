import Link from "next/link"

export default function AppNotFound() {
  return (
    <div className="rounded-xl border bg-card p-8 text-center">
      <h1 className="text-xl font-semibold">Not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This item doesn&apos;t exist or may have been removed.
      </p>
      <Link href="/" className="mt-4 inline-block text-sm underline underline-offset-4">
        Go to dashboard
      </Link>
    </div>
  )
}
