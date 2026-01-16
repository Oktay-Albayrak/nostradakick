-- DropForeignKey
ALTER TABLE "prediction" DROP CONSTRAINT "prediction_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_stat" DROP CONSTRAINT "user_stat_user_id_fkey";

-- AddForeignKey
ALTER TABLE "user_stat" ADD CONSTRAINT "user_stat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction" ADD CONSTRAINT "prediction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
