-- AlterTable
ALTER TABLE "User" ADD COLUMN "avatarImage" TEXT;
ALTER TABLE "User" ADD COLUMN "name" TEXT;

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_key_key" ON "Settings"("key");
