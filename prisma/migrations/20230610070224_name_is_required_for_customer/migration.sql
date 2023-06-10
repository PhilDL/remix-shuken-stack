/*
  Warnings:

  - You are about to drop the column `tierId` on the `Customer` table. All the data in the column will be lost.
  - Made the column `name` on table `Customer` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "avatarImage" TEXT,
    "emailCount" INTEGER NOT NULL DEFAULT 0,
    "emailOpenedCount" INTEGER NOT NULL DEFAULT 0,
    "emailOpenRate" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "subscribed" BOOLEAN NOT NULL DEFAULT false,
    "comped" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" DATETIME,
    "stripeCustomerId" TEXT
);
INSERT INTO "new_Customer" ("avatarImage", "comped", "createdAt", "email", "emailCount", "emailOpenRate", "emailOpenedCount", "id", "lastSeenAt", "name", "note", "status", "stripeCustomerId", "subscribed", "updatedAt") SELECT "avatarImage", "comped", "createdAt", "email", "emailCount", "emailOpenRate", "emailOpenedCount", "id", "lastSeenAt", "name", "note", "status", "stripeCustomerId", "subscribed", "updatedAt" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
CREATE UNIQUE INDEX "Customer_stripeCustomerId_key" ON "Customer"("stripeCustomerId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
