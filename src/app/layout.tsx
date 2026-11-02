import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: "LabBorrow James",
    template: "%s · LabBorrow James",
  },
  description: "Reserve school laboratories, rooms, and equipment.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("h-full antialiased", "font-sans", inter.variable)}>
      <body className="flex min-h-full flex-col">{children}
        <Toaster />
      </body>
    </html>
  )
}
