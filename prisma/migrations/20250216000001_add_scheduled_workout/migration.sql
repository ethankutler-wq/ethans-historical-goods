-- CreateTable
CREATE TABLE "ScheduledWorkout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT,
    "plannedDurationMinutes" INTEGER,
    "plannedDistanceMeters" INTEGER,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "ScheduledWorkout_date_idx" ON "ScheduledWorkout"("date");
