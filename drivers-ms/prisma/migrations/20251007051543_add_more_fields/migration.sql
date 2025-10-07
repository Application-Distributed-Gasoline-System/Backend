/*
  Warnings:

  - Added the required column `birthDate` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isAvailable` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `license` on the `Driver` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "License" AS ENUM ('C', 'D', 'E', 'G');

-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "birthDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
DROP COLUMN "license",
ADD COLUMN     "license" "License" NOT NULL;
