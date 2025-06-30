/*
  Warnings:

  - Added the required column `makeModel` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN "makeModel" TEXT NOT NULL DEFAULT 'Unknown';

