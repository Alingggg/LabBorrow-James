ALTER TABLE "resources" ALTER COLUMN "description" DROP NOT NULL;
UPDATE "resources" SET "description" = NULL WHERE "description" = '';
