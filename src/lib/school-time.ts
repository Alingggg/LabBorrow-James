import { TZDate } from "@date-fns/tz"
import { format, isSameDay } from "date-fns"

export const SCHOOL_TIMEZONE = "Asia/Manila"

export type LocalParts = {
  date: string // YYYY-MM-DD
  time: string // HH:mm
  weekday: number // 0 (Sunday) to 6 (Saturday), matches operating_hours.day_of_week
}

export function utcToLocalParts(instant: Date): LocalParts {
  const local = new TZDate(instant, SCHOOL_TIMEZONE)
  return {
    date: format(local, "yyyy-MM-dd"),
    time: format(local, "HH:mm"),
    weekday: local.getDay(),
  }
}

export function localPartsToUtc(date: string, time: string): Date | null {
  const [year, month, day] = date.split("-").map(Number)
  const [hour, minute] = time.split(":").map(Number)
  if ([year, month, day, hour, minute].some((n) => !Number.isInteger(n))) {
    return null
  }
  const local = new TZDate(year, month - 1, day, hour, minute, 0, SCHOOL_TIMEZONE)
  // Rejects out-of-range parts (e.g. Feb 30) that Date silently rolls over
  const roundTrip = utcToLocalParts(local)
  return roundTrip.date === date && roundTrip.time === time
    ? new Date(local.getTime())
    : null
}

const DATE_TIME_FORMAT = "MMM d, yyyy, h:mm a"
const TIME_FORMAT = "h:mm a"

export function formatSchoolDateTime(instant: Date) {
  return format(new TZDate(instant, SCHOOL_TIMEZONE), DATE_TIME_FORMAT)
}

export function formatSchoolRange(start: Date, end: Date) {
  const localStart = new TZDate(start, SCHOOL_TIMEZONE)
  const localEnd = new TZDate(end, SCHOOL_TIMEZONE)
  const endText = format(
    localEnd,
    isSameDay(localStart, localEnd) ? TIME_FORMAT : DATE_TIME_FORMAT
  )
  return `${format(localStart, DATE_TIME_FORMAT)} – ${endText}`
}
