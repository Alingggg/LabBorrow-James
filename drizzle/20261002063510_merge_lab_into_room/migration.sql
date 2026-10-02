ALTER TABLE "resources" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
UPDATE "resources" SET "type" = 'ROOM' WHERE "type" = 'LAB';--> statement-breakpoint
DROP TYPE "resource_type";--> statement-breakpoint
CREATE TYPE "resource_type" AS ENUM('ROOM', 'EQUIPMENT');--> statement-breakpoint
ALTER TABLE "resources" ALTER COLUMN "type" SET DATA TYPE "resource_type" USING "type"::"resource_type";