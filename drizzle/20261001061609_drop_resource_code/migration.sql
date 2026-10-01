DROP INDEX "resources_code_uidx";--> statement-breakpoint
ALTER TABLE "resources" DROP COLUMN "code";--> statement-breakpoint
CREATE UNIQUE INDEX "resources_name_uidx" ON "resources" ("name");