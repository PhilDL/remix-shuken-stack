/*
  Warnings:

  - Added the required column `stripeProductId` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN DEFAULT true,
    "stripeProductId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Plan" ("active", "createdAt", "description", "id", "name", "updatedAt") SELECT "active", "createdAt", "description", "id", "name", "updatedAt" FROM "Plan";
DROP TABLE "Plan";
ALTER TABLE "new_Plan" RENAME TO "Plan";
CREATE UNIQUE INDEX "Plan_id_key" ON "Plan"("id");
CREATE UNIQUE INDEX "Plan_stripeProductId_key" ON "Plan"("stripeProductId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
