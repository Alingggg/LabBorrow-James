// Usage: npm run seed:resources (skips names that already exist)
import { db } from "@/db"
import { resources } from "@/db/schema"

type SeedResource = Omit<typeof resources.$inferInsert, "type">

const rooms = ([
  { name: "Chemistry Lab 1", description: "Fume hoods, 12 workbenches, eyewash station.", maxReservationMinutes: 180 },
  { name: "Chemistry Lab 2", description: "Advanced chemistry lab with instrument bench.", accessScope: "FACULTY_STAFF", maxReservationMinutes: 180 },
  { name: "Physics Lab", description: "Optics and mechanics benches, 30 seats.", maxReservationMinutes: 180 },
  { name: "Biology Lab", description: "Microscope stations and specimen storage.", maxReservationMinutes: 180 },
  { name: "Computer Lab A", description: "40 desktop PCs with projector.", maxReservationMinutes: 180 },
  { name: "Computer Lab B", description: "30 desktop PCs, programming software installed.", maxReservationMinutes: 180 },
  { name: "Robotics Lab", description: "Workbenches, soldering stations, and 3D printing area.", accessScope: "FACULTY_STAFF", maxReservationMinutes: 240 },
  { name: "Audio-Visual Room", description: "Projector, sound system, 60 seats.", maxReservationMinutes: 120 },
  { name: "Conference Room", description: "Board table for 16 with video conferencing.", accessScope: "FACULTY_STAFF", maxReservationMinutes: 120 },
  { name: "Faculty Meeting Room", description: "Seats 10, whiteboard and TV display.", accessScope: "FACULTY_STAFF", maxReservationMinutes: 90 },
  { name: "Study Room 1", description: "Seats 6, whiteboard.", maxReservationMinutes: 120 },
  { name: "Study Room 2", description: "Seats 6, whiteboard.", maxReservationMinutes: 120 },
  { name: "Multipurpose Hall", description: "Open hall for events, seats up to 200.", accessScope: "FACULTY_STAFF", maxReservationMinutes: 240 },
  { name: "Drafting Room", description: "Drafting tables, under renovation.", status: "UNAVAILABLE", maxReservationMinutes: 180 },
] satisfies SeedResource[]).map((room) => ({ ...room, type: "ROOM" as const }))

const equipment = ([
  { name: "Projector 1", description: "Epson EB-X51 with HDMI cable.", maxReservationMinutes: 180 },
  { name: "Projector 2", description: "Epson EB-X51 with HDMI cable.", maxReservationMinutes: 180 },
  { name: "Laptop 1", description: "Dell Latitude 5440 with charger.", maxReservationMinutes: 240 },
  { name: "Laptop 2", description: "Dell Latitude 5440 with charger.", maxReservationMinutes: 240 },
  { name: "Laptop 3", description: "Dell Latitude 5440 with charger.", maxReservationMinutes: 240 },
  { name: "Document Camera", description: "USB document camera for live demos.", maxReservationMinutes: 120 },
  { name: "Portable PA Speaker", description: "Bluetooth speaker with one wired microphone.", maxReservationMinutes: 180 },
  { name: "Wireless Microphone Set", description: "Two handheld mics and receiver.", maxReservationMinutes: 180 },
  { name: "Tripod", description: "Adjustable camera tripod.", maxReservationMinutes: 240 },
  { name: "Compound Microscope 1", description: "40x–1000x with LED illumination.", maxReservationMinutes: 120 },
  { name: "Compound Microscope 2", description: "40x–1000x with LED illumination.", maxReservationMinutes: 120 },
  { name: "DSLR Camera", description: "Canon EOS 250D with 18–55mm lens.", accessScope: "FACULTY_STAFF", maxReservationMinutes: 240 },
  { name: "Digital Oscilloscope", description: "2-channel, 100 MHz.", accessScope: "FACULTY_STAFF", maxReservationMinutes: 180 },
  { name: "3D Printer", description: "Prusa MK4, PLA filament only.", accessScope: "FACULTY_STAFF", maxReservationMinutes: 240 },
  { name: "VR Headset", description: "Meta Quest 3 with controllers.", accessScope: "FACULTY_STAFF", maxReservationMinutes: 120 },
  { name: "Overhead Projector", description: "Transparency projector.", status: "RETIRED", maxReservationMinutes: 120 },
] satisfies SeedResource[]).map((item) => ({ ...item, type: "EQUIPMENT" as const }))

const inserted = await db
  .insert(resources)
  .values([...rooms, ...equipment])
  .onConflictDoNothing({ target: resources.name })
  .returning({ name: resources.name })

console.log(`Added ${inserted.length} of ${rooms.length + equipment.length} resources.`)
await db.$client.end()
