/*
  Warnings:

  - Added the required column `license` to the `DriverRef` table without a default value. This is not possible if the table is not empty.
  - Added the required column `machineryType` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `available` to the `VehicleRef` table without a default value. This is not possible if the table is not empty.
  - Added the required column `averageConsumption` to the `VehicleRef` table without a default value. This is not possible if the table is not empty.
  - Added the required column `engineDisplacement` to the `VehicleRef` table without a default value. This is not possible if the table is not empty.
  - Added the required column `engineType` to the `VehicleRef` table without a default value. This is not possible if the table is not empty.
  - Added the required column `machineryType` to the `VehicleRef` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mileage` to the `VehicleRef` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `VehicleRef` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tankCapacity` to the `VehicleRef` table without a default value. This is not possible if the table is not empty.
  - Made the column `plate` on table `VehicleRef` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "MachineryType" AS ENUM ('LIGHT', 'HEAVY');

-- CreateEnum
CREATE TYPE "EngineType" AS ENUM ('GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID');

-- CreateEnum
CREATE TYPE "License" AS ENUM ('C', 'D', 'E', 'G');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('OPERATIONAL', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE');

-- AlterTable
ALTER TABLE "DriverRef" ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "license" "License" NOT NULL;

-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "actualFuelL" DOUBLE PRECISION,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "machineryType" "MachineryType" NOT NULL,
ADD COLUMN     "startedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "VehicleRef" ADD COLUMN     "available" BOOLEAN NOT NULL,
ADD COLUMN     "averageConsumption" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "engineDisplacement" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "engineType" "EngineType" NOT NULL,
ADD COLUMN     "machineryType" "MachineryType" NOT NULL,
ADD COLUMN     "mileage" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "status" "VehicleStatus" NOT NULL,
ADD COLUMN     "tankCapacity" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "plate" SET NOT NULL;
