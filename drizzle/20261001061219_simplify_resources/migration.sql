ALTER TABLE "resources" DROP CONSTRAINT "resources_max_reservation_positive";--> statement-breakpoint
ALTER TABLE "resources" DROP COLUMN "location";--> statement-breakpoint
ALTER TABLE "resources" DROP COLUMN "approval_mode";--> statement-breakpoint
ALTER TABLE "resources" DROP COLUMN "access_scope";--> statement-breakpoint
ALTER TABLE "resources" DROP COLUMN "max_reservation_minutes";--> statement-breakpoint
DROP TYPE "approval_mode";--> statement-breakpoint
DROP TYPE "resource_access_scope";