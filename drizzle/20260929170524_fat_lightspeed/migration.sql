CREATE TYPE "approval_mode" AS ENUM('AUTO_APPROVE', 'APPROVAL_REQUIRED');--> statement-breakpoint
CREATE TYPE "resource_access_scope" AS ENUM('ALL_USERS', 'FACULTY_STAFF');--> statement-breakpoint
CREATE TYPE "resource_status" AS ENUM('AVAILABLE', 'UNAVAILABLE', 'RETIRED');--> statement-breakpoint
CREATE TYPE "resource_type" AS ENUM('LAB', 'ROOM', 'EQUIPMENT');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('STUDENT', 'FACULTY', 'RESOURCE_STAFF', 'ADMIN');--> statement-breakpoint
CREATE TABLE "facility_settings" (
	"id" text PRIMARY KEY DEFAULT 'default',
	"institution_name" text DEFAULT 'LabReserve Campus' NOT NULL,
	"timezone" text DEFAULT 'Asia/Manila' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "facility_settings_singleton" CHECK ("id" = 'default')
);
--> statement-breakpoint
CREATE TABLE "maintenance_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"resource_id" uuid NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"reason" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "maintenance_periods_valid_range" CHECK ("start_at" < "end_at")
);
--> statement-breakpoint
CREATE TABLE "operating_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"day_of_week" smallint NOT NULL,
	"open_time" time,
	"close_time" time,
	"is_closed" boolean DEFAULT false NOT NULL,
	CONSTRAINT "operating_hours_day_range" CHECK ("day_of_week" between 0 and 6),
	CONSTRAINT "operating_hours_valid_range" CHECK (("is_closed" and "open_time" is null and "close_time" is null) or (not "is_closed" and "open_time" is not null and "close_time" is not null and "open_time" < "close_time"))
);
--> statement-breakpoint
CREATE TABLE "resource_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"category_id" uuid NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"type" "resource_type" NOT NULL,
	"location" text NOT NULL,
	"capacity" integer DEFAULT 1 NOT NULL,
	"approval_mode" "approval_mode" DEFAULT 'APPROVAL_REQUIRED'::"approval_mode" NOT NULL,
	"access_scope" "resource_access_scope" DEFAULT 'ALL_USERS'::"resource_access_scope" NOT NULL,
	"max_reservation_minutes" integer DEFAULT 120 NOT NULL,
	"status" "resource_status" DEFAULT 'AVAILABLE'::"resource_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resources_capacity_positive" CHECK ("capacity" > 0),
	CONSTRAINT "resources_max_reservation_positive" CHECK ("max_reservation_minutes" > 0)
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "user_role" DEFAULT 'STUDENT'::"user_role" NOT NULL;--> statement-breakpoint
CREATE INDEX "maintenance_periods_resource_start_idx" ON "maintenance_periods" ("resource_id","start_at");--> statement-breakpoint
CREATE UNIQUE INDEX "operating_hours_day_uidx" ON "operating_hours" ("day_of_week");--> statement-breakpoint
CREATE UNIQUE INDEX "resource_categories_name_uidx" ON "resource_categories" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "resources_code_uidx" ON "resources" ("code");--> statement-breakpoint
CREATE INDEX "resources_category_idx" ON "resources" ("category_id");--> statement-breakpoint
CREATE INDEX "resources_type_status_idx" ON "resources" ("type","status");--> statement-breakpoint
ALTER TABLE "maintenance_periods" ADD CONSTRAINT "maintenance_periods_resource_id_resources_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id");--> statement-breakpoint
ALTER TABLE "maintenance_periods" ADD CONSTRAINT "maintenance_periods_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_category_id_resource_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "resource_categories"("id");--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS "btree_gist";--> statement-breakpoint
ALTER TABLE "maintenance_periods" ADD CONSTRAINT "maintenance_periods_no_overlap" EXCLUDE USING gist (
	"resource_id" WITH =,
	tstzrange("start_at", "end_at", '[)') WITH &&
);--> statement-breakpoint
INSERT INTO "facility_settings" ("id", "institution_name", "timezone")
VALUES ('default', 'LabReserve Campus', 'Asia/Manila')
ON CONFLICT ("id") DO NOTHING;--> statement-breakpoint
INSERT INTO "operating_hours" ("day_of_week", "open_time", "close_time", "is_closed") VALUES
	(0, NULL, NULL, true),
	(1, '08:00', '17:00', false),
	(2, '08:00', '17:00', false),
	(3, '08:00', '17:00', false),
	(4, '08:00', '17:00', false),
	(5, '08:00', '17:00', false),
	(6, '08:00', '12:00', false)
ON CONFLICT ("day_of_week") DO NOTHING;--> statement-breakpoint
CREATE FUNCTION "enforce_initial_administrator_registration"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	PERFORM pg_advisory_xact_lock(hashtextextended('labreserve-initial-administrator-registration', 0));

	IF EXISTS (SELECT 1 FROM "user") THEN
		RAISE EXCEPTION 'Initial Administrator registration is closed.';
	END IF;

	NEW."role" := 'ADMIN';
	RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "user_initial_administrator_registration"
BEFORE INSERT ON "user"
FOR EACH ROW
EXECUTE FUNCTION "enforce_initial_administrator_registration"();
