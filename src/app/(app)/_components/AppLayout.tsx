"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FlaskConical,
  LayoutDashboard,
  Menu,
  Microscope,
  Settings,
  Users,
} from "lucide-react"

import { SignOutButton } from "./SignOutButton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import type { SessionUser } from "@/lib/session"
import { cn } from "@/lib/utils"

const navigation = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/resources", label: "Resources", icon: Microscope },
  { href: "/admin/users", label: "Users & roles", icon: Users },
  { href: "/admin/settings", label: "School settings", icon: Settings },
] as const

function Brand({ institutionName }: { institutionName: string }) {
  return (
    <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <FlaskConical className="size-4.5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-none">LabReserve</span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">{institutionName}</span>
      </span>
    </Link>
  )
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="space-y-1" aria-label="Administrator navigation">
      {navigation.map((item) => {
        const active = item.href === "/admin"
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AppLayout({
  children,
  user,
  institutionName,
}: {
  children: ReactNode
  user: SessionUser
  institutionName: string
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-svh bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-background lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b px-5">
          <Brand institutionName={institutionName} />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5"><Navigation /></div>
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar><AvatarFallback>
              {user.name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join("")}
            </AvatarFallback></Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <Badge variant="outline" className="mt-1">Administrator</Badge>
            </div>
            <SignOutButton compact />
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <Menu aria-hidden="true" />
            </Button>
            <div className="lg:hidden"><Brand institutionName={institutionName} /></div>
            <p className="hidden text-sm text-muted-foreground lg:block">Administrator workspace</p>
          </div>
          <div className="lg:hidden"><SignOutButton compact /></div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[290px] p-0">
          <SheetTitle className="sr-only">Administrator navigation</SheetTitle>
          <div className="border-b px-5 py-4"><Brand institutionName={institutionName} /></div>
          <div className="px-3 py-5"><Navigation onNavigate={() => setMobileOpen(false)} /></div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
