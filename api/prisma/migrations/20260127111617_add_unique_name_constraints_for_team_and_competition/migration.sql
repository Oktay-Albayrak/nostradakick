/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `competition` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `team` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "competition_name_key" ON "competition"("name");

-- CreateIndex
CREATE UNIQUE INDEX "team_name_key" ON "team"("name");
