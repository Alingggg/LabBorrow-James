import { TZDate } from "@date-fns/tz"
import { addDays, format, isSameDay, parse } from "date-fns"

export const SCHOOL_TIMEZONE = "Asia/Manila"

export const weekdayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

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

export function todayInSchool() {
  return utcToLocalParts(new Date()).date
}

export function shiftSchoolDate(date: string, days: number) {
  const start = localPartsToUtc(date, "12:00")
  if (!start) return null
  return utcToLocalParts(addDays(new TZDate(start, SCHOOL_TIMEZONE), days)).date
}

export function schoolDayBounds(date: string) {
  const next = shiftSchoolDate(date, 1)
  const start = localPartsToUtc(date, "00:00")
  const end = next ? localPartsToUtc(next, "00:00") : null
  return start && end ? { start, end, weekday: utcToLocalParts(start).weekday } : null
}

// Falls back to today for missing or malformed ?date= values
export function resolveSchoolDate(raw: unknown) {
  return typeof raw === "string" && schoolDayBounds(raw) ? raw : todayInSchool()
}

export function formatSchoolDay(date: string) {
  const start = localPartsToUtc(date, "12:00")
  return start ? format(new TZDate(start, SCHOOL_TIMEZONE), "EEEE, MMM d, yyyy") : date
}

export function clockToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number)
  return hour * 60 + minute
}

export function formatClockHour(hour: number) {
  return format(parse(String(hour), "H", new Date()), "h a")
}

// Operating-hours columns are wall-clock "HH:mm[:ss]" strings, not instants
export function formatClockRange(open: string, close: string) {
  const toText = (time: string) => format(parse(time.slice(0, 5), "HH:mm", new Date()), TIME_FORMAT)
  return `${toText(open)} – ${toText(close)}`
}

export function formatSchoolTime(instant: Date) {
  return format(new TZDate(instant, SCHOOL_TIMEZONE), TIME_FORMAT)
}

export function formatSchoolTimeRange(start: Date, end: Date) {
  return `${format(new TZDate(start, SCHOOL_TIMEZONE), TIME_FORMAT)} – ${format(new TZDate(end, SCHOOL_TIMEZONE), TIME_FORMAT)}`
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
