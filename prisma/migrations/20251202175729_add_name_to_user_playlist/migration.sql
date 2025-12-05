/*
  Warnings:

  - Added the required column `name` to the `UserPlaylist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserPlaylist" ADD COLUMN     "name" TEXT NOT NULL;
