-- AlterTable
ALTER TABLE "competition" ALTER COLUMN "api_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "match" ALTER COLUMN "api_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "team" ALTER COLUMN "api_id" DROP NOT NULL;
