CREATE TYPE "access_scope" AS ENUM('ALL_USERS', 'FACULTY_STAFF');--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "access_scope" "access_scope" DEFAULT 'ALL_USERS'::"access_scope" NOT NULL;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "max_reservation_minutes" integer DEFAULT 120 NOT NULL;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_max_minutes_positive" CHECK ("max_reservation_minutes" > 0);