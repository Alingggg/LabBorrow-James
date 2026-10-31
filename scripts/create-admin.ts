// Usage: ADMIN_NAME="Jane" ADMIN_EMAIL=jane@example.com ADMIN_PASSWORD=... npm run create-admin
import { createUser } from "@/db/create-user"
import { db } from "@/db"

const name = process.env.ADMIN_NAME?.trim()
const email = process.env.ADMIN_EMAIL?.trim()
const password = process.env.ADMIN_PASSWORD

if (!name || !email || !password || password.length < 8) {
  console.error(
    "Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD (at least 8 characters)."
  )
  process.exit(1)
}

await createUser({ name, email, password, role: "ADMIN" })
console.log(`Created administrator ${email.toLowerCase()}.`)
await db.$client.end()
