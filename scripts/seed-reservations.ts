// Usage: npm run seed:reservations (run seed:resources first; skips bookings that already exist)
import { addDays, addHours, addMinutes, subDays } from "date-fns"
import { and, eq, inArray } from "drizzle-orm"

import { createUser } from "@/db/create-user"
import { db } from "@/db"
import { equipmentCheckouts, reservations, reservationStatusHistory, resources, user } from "@/db/schema"
import type { ReservationStatus } from "@/lib/reservation-status"
import type { UserRole } from "@/lib/roles"
import { localPartsToUtc, shiftSchoolDate, todayInSchool, utcToLocalParts } from "@/lib/school-time"

const MOCK_PASSWORD = "labborrow123"

const mockUsers: { name: string; email: string; role: UserRole }[] = [
  { name: "Lea Mendoza", email: "lea.mendoza@labborrow.test", role: "FACULTY" },
  { name: "Carlo Diaz", email: "carlo.diaz@labborrow.test", role: "FACULTY" },
  { name: "Bea Lim", email: "bea.lim@labborrow.test", role: "STUDENT" },
  { name: "Miguel Tan", email: "miguel.tan@labborrow.test", role: "STUDENT" },
  { name: "Ella Garcia", email: "ella.garcia@labborrow.test", role: "STUDENT" },
]

type Seed = {
  resource: string
  owner: string // email local part
  day: number // school weekdays from today; 0 is today (or the next weekday)
  start: string
  end: string
  purpose: string
  flow: ReservationStatus[]
  bookedBy?: string // staff who booked on the owner's behalf
  reason?: string
  notes?: string
}

const seeds: Seed[] = [
  // Pending, upcoming
  { resource: "Computer Lab A", owner: "student", day: 1, start: "09:00", end: "11:00", purpose: "Programming club practice", flow: ["PENDING_APPROVAL"] },
  { resource: "Study Room 1", owner: "bea.lim", day: 2, start: "13:00", end: "15:00", purpose: "Group study for Calculus exam", flow: ["PENDING_APPROVAL"] },
  { resource: "Physics Lab", owner: "lea.mendoza", day: 3, start: "08:00", end: "10:00", purpose: "PHYS 101 pendulum experiment", flow: ["PENDING_APPROVAL"] },
  { resource: "Chemistry Lab 2", owner: "carlo.diaz", day: 1, start: "13:00", end: "16:00", purpose: "CHEM 201 titration lab", flow: ["PENDING_APPROVAL"] },
  { resource: "Projector 1", owner: "student", day: 1, start: "09:00", end: "11:00", purpose: "Thesis proposal defense", flow: ["PENDING_APPROVAL"] },
  { resource: "Laptop 1", owner: "bea.lim", day: 2, start: "08:00", end: "12:00", purpose: "Research encoding", flow: ["PENDING_APPROVAL"] },
  { resource: "DSLR Camera", owner: "lea.mendoza", day: 3, start: "13:00", end: "17:00", purpose: "Department event coverage", flow: ["PENDING_APPROVAL"] },

  // Pending, time already passed
  { resource: "Biology Lab", owner: "miguel.tan", day: -2, start: "10:00", end: "12:00", purpose: "Specimen observation", flow: ["PENDING_APPROVAL"] },
  { resource: "Audio-Visual Room", owner: "ella.garcia", day: -1, start: "14:00", end: "16:00", purpose: "Org general assembly", flow: ["PENDING_APPROVAL"] },
  { resource: "Laptop 2", owner: "miguel.tan", day: -1, start: "13:00", end: "15:00", purpose: "Online quiz", flow: ["PENDING_APPROVAL"] },

  // Confirmed, upcoming
  { resource: "Computer Lab A", owner: "faculty", day: 1, start: "13:00", end: "16:00", purpose: "IT 101 lab exam", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Conference Room", owner: "lea.mendoza", day: 2, start: "09:00", end: "10:30", purpose: "Science department meeting", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Study Room 2", owner: "student", day: 1, start: "15:00", end: "17:00", purpose: "Capstone team meeting", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Chemistry Lab 1", owner: "bea.lim", day: 4, start: "08:00", end: "11:00", purpose: "Make-up lab activity", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Computer Lab B", owner: "faculty", day: 0, start: "13:00", end: "15:00", purpose: "Remedial programming class", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Projector 2", owner: "faculty", day: 1, start: "13:00", end: "16:00", purpose: "Guest lecture", flow: ["PENDING_APPROVAL", "CONFIRMED"] },

  // Booked by staff on behalf of a user
  { resource: "Multipurpose Hall", owner: "carlo.diaz", day: 5, start: "13:00", end: "17:00", purpose: "Science fair setup", flow: ["CONFIRMED"], bookedBy: "maria.santos" },
  { resource: "Wireless Microphone Set", owner: "carlo.diaz", day: 5, start: "13:00", end: "16:00", purpose: "Science fair program", flow: ["CONFIRMED"], bookedBy: "maria.santos" },
  { resource: "Portable PA Speaker", owner: "carlo.diaz", day: 5, start: "13:00", end: "16:00", purpose: "Science fair program", flow: ["CONFIRMED"], bookedBy: "jose.reyes" },

  // Confirmed, already ended (ready to complete)
  { resource: "Physics Lab", owner: "faculty", day: -3, start: "09:00", end: "12:00", purpose: "Optics demonstration", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Study Room 1", owner: "miguel.tan", day: -1, start: "10:00", end: "12:00", purpose: "Review session", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Tripod", owner: "ella.garcia", day: -2, start: "09:00", end: "11:00", purpose: "Video project shoot", flow: ["PENDING_APPROVAL", "CONFIRMED"] },

  // Equipment checked out
  { resource: "Laptop 3", owner: "student", day: -1, start: "08:00", end: "12:00", purpose: "Thesis data analysis", flow: ["PENDING_APPROVAL", "CONFIRMED", "CHECKED_OUT"], notes: "Charger included." },
  { resource: "Compound Microscope 1", owner: "bea.lim", day: 0, start: "08:00", end: "10:00", purpose: "Cell structure lab report", flow: ["PENDING_APPROVAL", "CONFIRMED", "CHECKED_OUT"], notes: "Slides and cover slips included." },

  // Equipment returned (ready to complete)
  { resource: "3D Printer", owner: "carlo.diaz", day: -3, start: "13:00", end: "17:00", purpose: "Robotics part prototypes", flow: ["PENDING_APPROVAL", "CONFIRMED", "CHECKED_OUT", "RETURNED"], notes: "Nozzle cleaned; spool at 40%." },
  { resource: "Document Camera", owner: "lea.mendoza", day: -2, start: "08:00", end: "10:00", purpose: "Classroom demo", flow: ["PENDING_APPROVAL", "CONFIRMED", "CHECKED_OUT", "RETURNED"], notes: "Returned with USB cable." },

  // Completed
  { resource: "Computer Lab B", owner: "lea.mendoza", day: -5, start: "13:00", end: "16:00", purpose: "Faculty training", flow: ["PENDING_APPROVAL", "CONFIRMED", "COMPLETED"] },
  { resource: "Audio-Visual Room", owner: "faculty", day: -7, start: "09:00", end: "11:00", purpose: "Film viewing, LIT 102", flow: ["PENDING_APPROVAL", "CONFIRMED", "COMPLETED"] },
  { resource: "Projector 1", owner: "faculty", day: -6, start: "09:00", end: "12:00", purpose: "Seminar presentation", flow: ["PENDING_APPROVAL", "CONFIRMED", "CHECKED_OUT", "RETURNED", "COMPLETED"], notes: "Returned in good condition." },
  { resource: "Digital Oscilloscope", owner: "carlo.diaz", day: -8, start: "13:00", end: "16:00", purpose: "Circuits lab", flow: ["PENDING_APPROVAL", "CONFIRMED", "CHECKED_OUT", "RETURNED", "COMPLETED"], notes: "Probe 2 loose; flagged for repair." },

  // Rejected
  { resource: "Computer Lab B", owner: "ella.garcia", day: 2, start: "09:00", end: "12:00", purpose: "Org tutorial session", flow: ["PENDING_APPROVAL", "REJECTED"], reason: "Lab is reserved for faculty training that morning." },
  { resource: "Biology Lab", owner: "student", day: -4, start: "13:00", end: "15:00", purpose: "Extra lab practice", flow: ["PENDING_APPROVAL", "REJECTED"], reason: "Lab maintenance scheduled that afternoon." },
  { resource: "VR Headset", owner: "lea.mendoza", day: 4, start: "09:00", end: "11:00", purpose: "Virtual field trip", flow: ["PENDING_APPROVAL", "REJECTED"], reason: "Headset is reserved for orientation week." },

  // Cancelled
  { resource: "Chemistry Lab 1", owner: "student", day: 3, start: "13:00", end: "15:00", purpose: "Science project", flow: ["PENDING_APPROVAL", "CANCELLED"], reason: "No longer needed." },
  { resource: "Conference Room", owner: "carlo.diaz", day: -2, start: "13:00", end: "15:00", purpose: "Thesis panel", flow: ["PENDING_APPROVAL", "CONFIRMED", "CANCELLED"], reason: "Room needed for accreditation visit." },
  { resource: "Laptop 1", owner: "miguel.tan", day: -3, start: "13:00", end: "16:00", purpose: "Encoding grades", flow: ["PENDING_APPROVAL", "CANCELLED"] },

  // Busy day: today
  { resource: "Computer Lab A", owner: "faculty", day: 0, start: "08:00", end: "10:00", purpose: "IT 102 lecture lab", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Computer Lab A", owner: "lea.mendoza", day: 0, start: "10:00", end: "12:00", purpose: "Spreadsheet training", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Computer Lab A", owner: "carlo.diaz", day: 0, start: "15:00", end: "17:00", purpose: "Arduino simulation class", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Computer Lab B", owner: "lea.mendoza", day: 0, start: "08:00", end: "10:00", purpose: "Data science workshop", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Computer Lab B", owner: "ella.garcia", day: 0, start: "15:00", end: "17:00", purpose: "Org website sprint", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Physics Lab", owner: "faculty", day: 0, start: "08:00", end: "11:00", purpose: "Projectile motion lab", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Chemistry Lab 1", owner: "carlo.diaz", day: 0, start: "09:00", end: "12:00", purpose: "Stoichiometry lab", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Biology Lab", owner: "lea.mendoza", day: 0, start: "13:00", end: "16:00", purpose: "Dissection practical", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Study Room 1", owner: "bea.lim", day: 0, start: "09:00", end: "11:00", purpose: "Thesis writing", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Study Room 1", owner: "miguel.tan", day: 0, start: "13:00", end: "15:00", purpose: "Accounting review", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Projector 1", owner: "lea.mendoza", day: 0, start: "13:00", end: "16:00", purpose: "Biology lecture slides", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Laptop 1", owner: "carlo.diaz", day: 0, start: "13:00", end: "17:00", purpose: "Robotics programming", flow: ["PENDING_APPROVAL", "CONFIRMED", "CHECKED_OUT"], notes: "Charger and mouse included." },

  // Busy day: next school day
  { resource: "Computer Lab A", owner: "faculty", day: 1, start: "08:00", end: "09:00", purpose: "Lab prep", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Computer Lab A", owner: "ella.garcia", day: 1, start: "16:00", end: "17:00", purpose: "Hackathon briefing", flow: ["PENDING_APPROVAL"] },
  { resource: "Computer Lab B", owner: "lea.mendoza", day: 1, start: "08:00", end: "10:00", purpose: "Statistics lab", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Computer Lab B", owner: "miguel.tan", day: 1, start: "10:00", end: "12:00", purpose: "Typing exam practice", flow: ["PENDING_APPROVAL"] },
  { resource: "Computer Lab B", owner: "student", day: 1, start: "13:00", end: "14:30", purpose: "Research encoding", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Computer Lab B", owner: "bea.lim", day: 1, start: "15:00", end: "17:00", purpose: "Group programming project", flow: ["PENDING_APPROVAL"] },
  { resource: "Physics Lab", owner: "faculty", day: 1, start: "08:00", end: "10:00", purpose: "Electricity lab", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Physics Lab", owner: "bea.lim", day: 1, start: "10:30", end: "12:00", purpose: "Lab report data collection", flow: ["PENDING_APPROVAL"] },
  { resource: "Physics Lab", owner: "lea.mendoza", day: 1, start: "13:00", end: "16:00", purpose: "Optics lab", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Chemistry Lab 1", owner: "carlo.diaz", day: 1, start: "08:00", end: "11:00", purpose: "Acids and bases lab", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Chemistry Lab 1", owner: "student", day: 1, start: "13:00", end: "15:00", purpose: "Science investigatory project", flow: ["PENDING_APPROVAL"] },
  { resource: "Chemistry Lab 1", owner: "lea.mendoza", day: 1, start: "15:00", end: "17:00", purpose: "Lab safety orientation", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Biology Lab", owner: "lea.mendoza", day: 1, start: "09:00", end: "11:00", purpose: "Plant cell observation", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Biology Lab", owner: "miguel.tan", day: 1, start: "13:00", end: "14:00", purpose: "Specimen re-check", flow: ["PENDING_APPROVAL"] },
  { resource: "Biology Lab", owner: "ella.garcia", day: 1, start: "14:00", end: "16:00", purpose: "Biology club meeting", flow: ["PENDING_APPROVAL"] },
  { resource: "Study Room 1", owner: "miguel.tan", day: 1, start: "08:00", end: "10:00", purpose: "Exam review", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Study Room 1", owner: "ella.garcia", day: 1, start: "10:00", end: "12:00", purpose: "Org planning", flow: ["PENDING_APPROVAL"] },
  { resource: "Study Room 1", owner: "bea.lim", day: 1, start: "13:00", end: "15:00", purpose: "Thesis meeting", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Study Room 1", owner: "student", day: 1, start: "15:00", end: "17:00", purpose: "Peer tutoring", flow: ["PENDING_APPROVAL"] },
  { resource: "Study Room 2", owner: "bea.lim", day: 1, start: "08:00", end: "09:30", purpose: "Quiz review", flow: ["PENDING_APPROVAL"] },
  { resource: "Study Room 2", owner: "miguel.tan", day: 1, start: "10:00", end: "12:00", purpose: "Case study discussion", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Study Room 2", owner: "ella.garcia", day: 1, start: "13:00", end: "14:30", purpose: "Mock interview practice", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Audio-Visual Room", owner: "faculty", day: 1, start: "09:00", end: "11:00", purpose: "Documentary screening", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Audio-Visual Room", owner: "carlo.diaz", day: 1, start: "13:00", end: "15:00", purpose: "Robotics team presentation", flow: ["PENDING_APPROVAL"] },
  { resource: "Projector 1", owner: "lea.mendoza", day: 1, start: "13:00", end: "15:00", purpose: "Lecture presentation", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Projector 1", owner: "miguel.tan", day: 1, start: "15:00", end: "17:00", purpose: "Group report", flow: ["PENDING_APPROVAL"] },
  { resource: "Laptop 1", owner: "ella.garcia", day: 1, start: "08:00", end: "12:00", purpose: "Online certification exam", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Laptop 1", owner: "student", day: 1, start: "13:00", end: "17:00", purpose: "Thesis writing", flow: ["PENDING_APPROVAL"] },
  { resource: "Laptop 2", owner: "bea.lim", day: 1, start: "09:00", end: "12:00", purpose: "Survey encoding", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Laptop 2", owner: "miguel.tan", day: 1, start: "13:00", end: "16:00", purpose: "Spreadsheet project", flow: ["PENDING_APPROVAL"] },
  { resource: "Compound Microscope 1", owner: "bea.lim", day: 1, start: "08:00", end: "10:00", purpose: "Onion cell lab", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Compound Microscope 1", owner: "ella.garcia", day: 1, start: "10:00", end: "12:00", purpose: "Pond water sample", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Compound Microscope 1", owner: "miguel.tan", day: 1, start: "13:00", end: "15:00", purpose: "Blood smear lab", flow: ["PENDING_APPROVAL"] },
  { resource: "Compound Microscope 2", owner: "student", day: 1, start: "09:00", end: "11:00", purpose: "Onion cell lab", flow: ["PENDING_APPROVAL"] },
  { resource: "Compound Microscope 2", owner: "lea.mendoza", day: 1, start: "13:00", end: "15:00", purpose: "Microscopy demo", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Document Camera", owner: "faculty", day: 1, start: "10:00", end: "12:00", purpose: "Math problem walkthrough", flow: ["PENDING_APPROVAL", "CONFIRMED"] },
  { resource: "Tripod", owner: "ella.garcia", day: 1, start: "13:00", end: "17:00", purpose: "Short film shoot", flow: ["PENDING_APPROVAL"] },
]

for (const mock of mockUsers) {
  const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.email, mock.email)).limit(1)
  if (!existing) await createUser({ ...mock, password: MOCK_PASSWORD })
}

const users = await db.select({ id: user.id, email: user.email }).from(user)
const userId = (localPart: string) => {
  const found = users.find((item) => item.email === `${localPart}@labborrow.test`)
  if (!found) throw new Error(`Missing user ${localPart}@labborrow.test`)
  return found.id
}
const resourceRows = await db
  .select({ id: resources.id, name: resources.name })
  .from(resources)
  .where(inArray(resources.name, [...new Set(seeds.map((seed) => seed.resource))]))
const resourceId = (name: string) => {
  const found = resourceRows.find((item) => item.name === name)
  if (!found) throw new Error(`Missing resource "${name}"; run seed:resources first.`)
  return found.id
}

const isWeekday = (date: string) => {
  const weekday = utcToLocalParts(localPartsToUtc(date, "12:00")!).weekday
  return weekday >= 1 && weekday <= 5
}
function schoolWeekday(offset: number) {
  let date = todayInSchool()
  while (!isWeekday(date)) date = shiftSchoolDate(date, 1)!
  for (let step = 0; step < Math.abs(offset); step++) {
    do date = shiftSchoolDate(date, Math.sign(offset))!
    while (!isWeekday(date))
  }
  return date
}

const staff = ["maria.santos", "jose.reyes", "ana.cruz"]
const now = new Date()
let added = 0

await db.transaction(async (tx) => {
  for (const [index, seed] of seeds.entries()) {
    const date = schoolWeekday(seed.day)
    const startAt = localPartsToUtc(date, seed.start)!
    const endAt = localPartsToUtc(date, seed.end)!
    const [existing] = await tx
      .select({ id: reservations.id })
      .from(reservations)
      .where(and(eq(reservations.resourceId, resourceId(seed.resource)), eq(reservations.startAt, startAt)))
      .limit(1)
    if (existing) continue
    added++
    const ownerId = userId(seed.owner)
    const staffId = userId(seed.bookedBy ?? staff[index % staff.length])
    const createdAt = subDays(startAt < now ? startAt : now, 2)

    const changedAt: Record<ReservationStatus, Date> = {
      PENDING_APPROVAL: createdAt,
      CONFIRMED: seed.bookedBy ? createdAt : addHours(createdAt, 3),
      REJECTED: addHours(createdAt, 4),
      CANCELLED: addDays(createdAt, 1),
      CHECKED_OUT: startAt,
      RETURNED: addMinutes(endAt, -10),
      COMPLETED: addMinutes(endAt, 30),
    }
    const status = seed.flow.at(-1)!
    const reviewed = seed.flow.find((step) => step === "CONFIRMED" || step === "REJECTED")

    const [created] = await tx
      .insert(reservations)
      .values({
        userId: ownerId,
        resourceId: resourceId(seed.resource),
        startAt,
        endAt,
        purpose: seed.purpose,
        status,
        reviewedBy: reviewed ? staffId : null,
        reviewedAt: reviewed ? changedAt[reviewed] : null,
        rejectionReason: status === "REJECTED" ? (seed.reason ?? null) : null,
        createdAt,
        updatedAt: changedAt[status],
      })
      .returning({ id: reservations.id })

    // A requester cancels their own unconfirmed request; staff cancel confirmed ones
    const ownerCancels = status === "CANCELLED" && !seed.flow.includes("CONFIRMED")
    await tx.insert(reservationStatusHistory).values(
      seed.flow.map((step, position) => ({
        reservationId: created!.id,
        fromStatus: position === 0 ? null : seed.flow[position - 1],
        toStatus: step,
        changedBy:
          (position === 0 && !seed.bookedBy) || (step === "CANCELLED" && ownerCancels) ? ownerId : staffId,
        changedAt: changedAt[step],
        reason: step === "REJECTED" || step === "CANCELLED" ? (seed.reason ?? null) : null,
      }))
    )

    if (seed.flow.includes("CHECKED_OUT")) {
      const returned = seed.flow.includes("RETURNED")
      await tx.insert(equipmentCheckouts).values({
        reservationId: created!.id,
        checkedOutBy: staffId,
        checkedOutAt: changedAt.CHECKED_OUT,
        returnedTo: returned ? staffId : null,
        returnedAt: returned ? changedAt.RETURNED : null,
        notes: seed.notes ?? "",
      })
    }
  }
})

console.log(`Added ${added} of ${seeds.length} reservations; mock accounts use the password in this script.`)
await db.$client.end()
