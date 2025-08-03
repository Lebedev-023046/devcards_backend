/*
  Warnings:

  - Made the column `description` on table `Deck` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "coverImageUrl" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DEFAULT '';
