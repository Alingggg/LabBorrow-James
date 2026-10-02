export type ActionErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INVALID_STATE"
  | "DATABASE_ERROR"

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | {
      ok: false
      code: ActionErrorCode
      message: string
      fieldErrors?: Record<string, string[]>
    }
