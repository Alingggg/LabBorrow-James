export function databaseErrorCode(error: unknown): string {
  if (typeof error !== "object" || !error) return ""
  if ("code" in error) return String(error.code)
  if ("cause" in error) return databaseErrorCode(error.cause)
  return ""
}
