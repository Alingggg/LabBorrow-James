import type { CSSProperties } from "react"

import type { ReservationStatus } from "@/lib/reservation-status"
import { formatClockHour } from "@/lib/school-time"
import { cn } from "@/lib/utils"
import type { ScheduleHours, ScheduleSlot } from "@/types/schedule"

const statusLabels: Partial<Record<ReservationStatus, string>> = {
  PENDING_APPROVAL: "Pending approval",
  CONFIRMED: "Confirmed",
  CHECKED_OUT: "Checked out",
}

const position = (range: ScheduleHours, minute: number) =>
  `${((minute - range.openMinute) / (range.closeMinute - range.openMinute)) * 100}%`

function hoursWithin(range: ScheduleHours) {
  const first = Math.ceil(range.openMinute / 60)
  const last = Math.floor(range.closeMinute / 60)
  return Array.from({ length: last - first + 1 }, (_, index) => first + index)
}

function describe(slot: ScheduleSlot) {
  const status = slot.overdue ? "Overdue" : (statusLabels[slot.status] ?? slot.status)
  return [slot.when, status, slot.requesterName, slot.purpose].filter(Boolean).join(" · ")
}

export function HourAxis({ range }: { range: ScheduleHours }) {
  const hours = hoursWithin(range)
  return (
    <div className="relative h-4 text-xs text-muted-foreground" aria-hidden="true">
      {hours.map((hour, index) => (
        <span
          key={hour}
          className={cn(
            "absolute top-0 whitespace-nowrap",
            index === 0 ? "" : index === hours.length - 1 ? "-translate-x-full" : "-translate-x-1/2",
            index % 2 === 1 && "max-sm:hidden"
          )}
          style={{ left: position(range, hour * 60) }}
        >
          {formatClockHour(hour)}
        </span>
      ))}
    </div>
  )
}

export function Timeline({ range, slots }: { range: ScheduleHours; slots: ScheduleSlot[] }) {
  const lines = hoursWithin(range).filter(
    (hour) => hour * 60 > range.openMinute && hour * 60 < range.closeMinute
  )
  const visible = slots
    .map((slot) => ({
      ...slot,
      from: Math.max(slot.startMinute, range.openMinute),
      to: Math.min(slot.endMinute, range.closeMinute),
    }))
    .filter((slot) => slot.to > slot.from)

  return (
    <div className="relative h-9 overflow-hidden rounded-md border bg-muted/40">
      {lines.map((hour) => (
        <span
          key={hour}
          className="absolute inset-y-0 border-l border-border/70"
          style={{ left: position(range, hour * 60) }}
          aria-hidden="true"
        />
      ))}
      <ul>
        {visible.map((slot) => {
          // 1px inset on each side keeps back-to-back bookings visually separate
          const style: CSSProperties = {
            left: `calc(${position(range, slot.from)} + 1px)`,
            width: `calc(${position(range, slot.to)} - ${position(range, slot.from)} - 2px)`,
          }
          const description = describe(slot)
          return (
            <li
              key={slot.id}
              title={description}
              className={cn(
                "absolute inset-y-1 flex items-center overflow-hidden rounded-sm border px-1.5 text-xs font-medium",
                slot.overdue
                  ? "border-destructive bg-destructive text-white"
                  : slot.status === "PENDING_APPROVAL"
                    ? "border-dashed border-primary/50 bg-primary/10 text-foreground"
                    : "border-primary bg-primary text-primary-foreground"
              )}
              style={style}
            >
              <span className="truncate max-sm:hidden" aria-hidden="true">
                {slot.to - slot.from >= 120 ? slot.when : slot.startLabel}
              </span>
              <span className="sr-only">{description}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function TimelineLegend({ showOverdue }: { showOverdue?: boolean }) {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="size-3 rounded-sm bg-primary" aria-hidden="true" />
        Booked
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-3 rounded-sm border border-dashed border-primary/50 bg-primary/10" aria-hidden="true" />
        Pending approval
      </span>
      {showOverdue && (
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-destructive" aria-hidden="true" />
          Overdue
        </span>
      )}
    </div>
  )
}
