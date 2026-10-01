"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { CreateUserForm } from "./CreateUserForm"

export function CreateUserSheet() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          Add user
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add user</SheetTitle>
          <SheetDescription>Create an account with a temporary password.</SheetDescription>
        </SheetHeader>
        <div className="px-4">
          <CreateUserForm onCreated={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
