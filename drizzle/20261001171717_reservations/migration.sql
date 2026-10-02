CREATE TYPE "equipment_condition" AS ENUM('GOOD', 'FAIR', 'DAMAGED');--> statement-breakpoint
CREATE TYPE "reservation_status" AS ENUM('PENDING_APPROVAL', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'CHECKED_OUT', 'RETURNED', 'COMPLETED');--> statement-breakpoint
CREATE TABLE "equipment_checkouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"reservation_id" uuid NOT NULL,
	"checked_out_by" text NOT NULL,
	"checked_out_at" timestamp with time zone DEFAULT now() NOT NULL,
	"returned_to" text,
	"returned_at" timestamp with time zone,
	"checkout_condition" "equipment_condition" NOT NULL,
	"return_condition" "equipment_condition",
	"notes" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservation_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"reservation_id" uuid NOT NULL,
	"from_status" "reservation_status",
	"to_status" "reservation_status" NOT NULL,
	"changed_by" text NOT NULL,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"resource_id" uuid NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"purpose" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"status" "reservation_status" NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservations_valid_range" CHECK ("end_at" > "start_at")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "equipment_checkouts_reservation_uidx" ON "equipment_checkouts" ("reservation_id");--> statement-breakpoint
CREATE INDEX "reservation_status_history_reservation_idx" ON "reservation_status_history" ("reservation_id");--> statement-breakpoint
CREATE INDEX "reservations_resource_start_idx" ON "reservations" ("resource_id","start_at");--> statement-breakpoint
CREATE INDEX "reservations_status_start_idx" ON "reservations" ("status","start_at");--> statement-breakpoint
CREATE INDEX "reservations_user_idx" ON "reservations" ("user_id");--> statement-breakpoint
ALTER TABLE "equipment_checkouts" ADD CONSTRAINT "equipment_checkouts_reservation_id_reservations_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id");--> statement-breakpoint
ALTER TABLE "equipment_checkouts" ADD CONSTRAINT "equipment_checkouts_checked_out_by_user_id_fkey" FOREIGN KEY ("checked_out_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "equipment_checkouts" ADD CONSTRAINT "equipment_checkouts_returned_to_user_id_fkey" FOREIGN KEY ("returned_to") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "reservation_status_history" ADD CONSTRAINT "reservation_status_history_reservation_id_reservations_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id");--> statement-breakpoint
ALTER TABLE "reservation_status_history" ADD CONSTRAINT "reservation_status_history_changed_by_user_id_fkey" FOREIGN KEY ("changed_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_resource_id_resources_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id");--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "user"("id");