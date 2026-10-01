"use client";

export default function AppError() {
  return (
    <div className="rounded-xl border bg-card p-8 text-center">
      <h1 className="text-xl font-semibold">This page could not be loaded</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Check the database connection and refresh the page.
      </p>
    </div>
  );
}
