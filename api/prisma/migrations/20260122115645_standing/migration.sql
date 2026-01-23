-- AlterTable
ALTER TABLE "match" ADD COLUMN     "featured_name" TEXT,
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "popularity" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "team" ADD COLUMN     "short_name" TEXT;

-- CreateTable
CREATE TABLE "standing" (
    "id" UUID NOT NULL,
    "rank" INTEGER NOT NULL,
    "team_id" UUID NOT NULL,
    "competition_id" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "standing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "standing_team_id_competition_id_key" ON "standing"("team_id", "competition_id");

-- AddForeignKey
ALTER TABLE "standing" ADD CONSTRAINT "standing_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standing" ADD CONSTRAINT "standing_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
