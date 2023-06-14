/*
  Warnings:

  - You are about to drop the column `planId` on the `Price` table. All the data in the column will be lost.
  - Added the required column `productId` to the `Price` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Price" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT NOT NULL DEFAULT 'one_time',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Price_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Price" ("active", "amount", "createdAt", "currency", "id", "interval", "type", "updatedAt") SELECT "active", "amount", "createdAt", "currency", "id", "interval", "type", "updatedAt" FROM "Price";
DROP TABLE "Price";
ALTER TABLE "new_Price" RENAME TO "Price";
CREATE UNIQUE INDEX "Price_id_key" ON "Price"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
