-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Price" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT NOT NULL DEFAULT 'one_time',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Price_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Price" ("active", "amount", "createdAt", "currency", "id", "interval", "planId", "updatedAt") SELECT "active", "amount", "createdAt", "currency", "id", "interval", "planId", "updatedAt" FROM "Price";
DROP TABLE "Price";
ALTER TABLE "new_Price" RENAME TO "Price";
CREATE UNIQUE INDEX "Price_id_key" ON "Price"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
