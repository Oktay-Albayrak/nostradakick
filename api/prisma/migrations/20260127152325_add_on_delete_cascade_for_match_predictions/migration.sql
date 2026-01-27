-- DropForeignKey
ALTER TABLE "prediction" DROP CONSTRAINT "prediction_match_id_fkey";

-- AddForeignKey
ALTER TABLE "prediction" ADD CONSTRAINT "prediction_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
