ALTER TABLE "resources" DROP CONSTRAINT "resources_category_id_resource_categories_id_fkey";--> statement-breakpoint
DROP TABLE "resource_categories";--> statement-breakpoint
DROP INDEX "resources_category_idx";--> statement-breakpoint
ALTER TABLE "resources" DROP COLUMN "category_id";--> statement-breakpoint
ALTER TABLE "resources" ALTER COLUMN "description" DROP DEFAULT;