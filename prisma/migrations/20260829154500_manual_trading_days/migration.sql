-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN "currentDayNumber" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Challenge" ADD COLUMN "currentDayDate" DATE;

-- AlterTable
ALTER TABLE "DailyBalance" ADD COLUMN "dayNumber" INTEGER NOT NULL DEFAULT 0;

-- Backfill open challenges so the official day is stored, not derived from the calendar.
UPDATE "Challenge"
SET
  "currentDayNumber" = 1,
  "currentDayDate" = "actualStartDate"
WHERE "actualStartDate" IS NOT NULL
  AND "status" = 'ACTIVE'
  AND "currentDayNumber" = 0;
