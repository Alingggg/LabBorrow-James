import { z, type ZodType } from "zod"

import { databaseErrorCode } from "@/lib/db-errors"
import type { ActionResult } from "@/types/action-result"

export type Failure = Extract<ActionResult<never>, { ok: false }>

export function validate<T>(
  schema: ZodType<T>,
  values: unknown
): { data: T } | { failure: Failure } {
  const parsed = schema.safeParse(values)
  if (parsed.success) return { data: parsed.data }
  return {
    failure: {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Please correct the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    },
  }
}

// Pass conflictMessage to map unique violations (23505) to CONFLICT
export function unexpectedError(error: unknown, conflictMessage?: string): Failure {
  if (conflictMessage && databaseErrorCode(error) === "23505") {
    return { ok: false, code: "CONFLICT", message: conflictMessage }
  }
  console.error(error)
  return {
    ok: false,
    code: "DATABASE_ERROR",
    message: "The request could not be completed. Please try again.",
  }
}
