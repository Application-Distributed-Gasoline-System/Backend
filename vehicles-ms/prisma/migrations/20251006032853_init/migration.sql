-- CreateEnum
CREATE TYPE "MachineryType" AS ENUM ('LIGHT', 'HEAVY');

-- CreateEnum
CREATE TYPE "EngineType" AS ENUM ('GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('OPERATIONAL', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE');

-- CreateTable
CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "plate" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "engineType" "EngineType" NOT NULL,
    "machineryType" "MachineryType" NOT NULL,
    "tankCapacity" DOUBLE PRECISION NOT NULL,
    "engineDisplacement" DOUBLE PRECISION NOT NULL,
    "averageConsumption" DOUBLE PRECISION NOT NULL,
    "mileage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "status" "VehicleStatus" NOT NULL DEFAULT 'OPERATIONAL',
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_key" ON "vehicles"("plate");
