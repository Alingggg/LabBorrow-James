# Next.js Code Organization Plan

Oct 2, 2026 · @Aling

## Mental model

Server actions are the controllers; `/data` functions are the services. Next.js is a frontend and backend in one project, so the usual Express layers compress into two folders.

| Express backend | Next.js |
| --- | --- |
| Route + middleware + controller | Server action (`actions.ts`) |
| Service / repository | `/data` functions |
| `res.json(...)` | `return { ... }` from the action |
| Client calls `fetch("/api/...")` | Client calls the action like a function |

Prisma already acts as the repository, so `/data` is one thin layer over it, not two.

## Folder structure

Route-specific code lives next to its route; anything shared lives in a top-level folder.

```
src/
  app/
    products/
      page.tsx
      actions.ts          // "use server": this route's mutations
      data.ts             // server-only: this route's reads
      schemas.ts          // zod schemas + inferred input types for this route
      types.ts            // types only this route uses
      _components/
  data/                   // shared DB logic, one file per entity
    db.ts                 // prisma client
    auth.ts               // getCurrentUser(), requireUser()
    products.ts           // server-only reads + writes
    users.ts
  actions/                // actions used by unrelated routes
    favorites.ts
  schemas/                // zod schemas used by several routes
    products.ts
  types/                  // types used by several routes
    products.ts
  components/             // shared UI
```

## Where code goes

Start colocated and move code up only when a second route needs it.

| Code | Used by one route | Used by several routes |
| --- | --- | --- |
| Read (query) | `app/<route>/data.ts` | `data/<entity>.ts` |
| Write (DB mutation) | Prisma call directly inside the action | `data/<entity>.ts` |
| Server action | `app/<route>/actions.ts` | `actions/<name>.ts` |
| Zod schema + input type | `app/<route>/schemas.ts` | `schemas/<entity>.ts` |
| Return type | `app/<route>/types.ts` | `types/<entity>.ts` |
| UI component | `app/<route>/_components/` | `components/` |

Top-level folders hold one flat file per entity (products, users) and exist only for code that is actually shared.

## Types and schemas

Route-only schemas and types sit next to the route; shared ones go in top-level `schemas/` and `types/`.

- **Schemas go in their own `schemas.ts`.** A `"use server"` file can only export async functions, and a `server-only` file can't be imported by client forms that reuse the schema for client-side validation.
- **Input types come from the schema:** `export type UpdatePriceInput = z.infer<typeof updatePriceSchema>`. Never hand-write a duplicate.
- **Return types come from Prisma.** Use the generated model type (`Product`) when it fits; otherwise derive it in `types.ts`, e.g. `Prisma.ProductGetPayload<{ include: { category: true } }>`.
- **Client components use `import type`** for anything from `data/`, so no server code ends up in the browser bundle.

## Anatomy of an action

An action handles the request around the DB write; the write itself can be delegated to `/data`.

```ts
// data/products.ts
import "server-only";
import { db } from "@/data/db";

export async function updateProductPrice(productId: string, price: number) {
  return db.product.update({ where: { id: productId }, data: { price } });
}
```

```ts
// app/products/schemas.ts  (no "use server", no server-only)
import { z } from "zod";

export const updatePriceSchema = z.object({
  productId: z.string(),
  price: z.coerce.number().positive(),
});
export type UpdatePriceInput = z.infer<typeof updatePriceSchema>;
```

```ts
// app/products/actions.ts
"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/data/auth";
import { updateProductPrice } from "@/data/products";
import { updatePriceSchema } from "./schemas";

export async function updatePriceAction(formData: FormData) {
  const user = await requireUser();                              // 1. auth
  if (user.role !== "admin") return { error: "Forbidden" };      // 2. permission
  const parsed = updatePriceSchema.safeParse(Object.fromEntries(formData)); // 3. validate
  if (!parsed.success) return { error: "Invalid input" };
  await updateProductPrice(parsed.data.productId, parsed.data.price); // 4. DB work
  revalidatePath("/products");                                   // 5. refresh UI
  return { success: true };                                      // 6. result for the form
}
```

## Rules

1. **Reads never go through actions.** Server components call `data/` functions directly; client components get data as props from a parent server component. Actions are POST-only, uncached, and run one at a time.
2. **Every action checks auth on its first line** with `requireUser()`. Middleware does not protect actions; each one is a public POST endpoint.
3. **`data/` files and route `data.ts` files start with `import "server-only"`** and never use `"use server"`, so DB functions are never exposed as endpoints.
4. **Schemas never live in `"use server"` or `server-only` files.** They go in `schemas.ts` (or `schemas/`) so both the action and client forms can import them.
5. **Start colocated, promote when shared.** Move code to a top-level folder only when a second route needs it.
6. **Keep actions thin once logic is shared.** Auth, validation and revalidation stay in the action; reusable DB work moves to `data/`.

## Skip for now, add when needed

| Skip | Add it when |
| --- | --- |
| A `features/` folder that mixes UI, data and actions | The app has many separate domains and `app/` gets hard to navigate |
| `next-safe-action` | You have 10+ actions repeating the same auth and Zod setup |
| Repository classes, DTOs, taint APIs | A real need appears; plain async functions are enough until then |
