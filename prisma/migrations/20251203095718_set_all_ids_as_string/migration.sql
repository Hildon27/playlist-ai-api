/*
  Warnings:

  - The primary key for the `Follow` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `FollowRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PlaylistComment` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Follow_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Follow_id_seq";

-- AlterTable
ALTER TABLE "FollowRequest" DROP CONSTRAINT "FollowRequest_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "FollowRequest_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "FollowRequest_id_seq";

-- AlterTable
ALTER TABLE "PlaylistComment" DROP CONSTRAINT "PlaylistComment_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "PlaylistComment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PlaylistComment_id_seq";
