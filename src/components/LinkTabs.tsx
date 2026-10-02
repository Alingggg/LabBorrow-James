import Link from "next/link"

import { cn } from "@/lib/utils"

export type LinkTab = { href: string; label: string; active: boolean }

export function LinkTabs({ tabs, label }: { tabs: LinkTab[]; label: string }) {
  return (
    <div className="flex gap-1 border-b" role="tablist" aria-label={label}>
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          role="tab"
          aria-selected={tab.active}
          className={cn(
            "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
            tab.active
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
