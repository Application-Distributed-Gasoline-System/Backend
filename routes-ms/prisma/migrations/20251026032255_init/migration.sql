-- CreateEnum
CREATE TYPE "RouteStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Route" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "estimatedFuelL" DOUBLE PRECISION,
    "status" "RouteStatus" NOT NULL DEFAULT 'PLANNED',
    "scheduledAt" TIMESTAMP(3),
    "driverId" TEXT NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverRef" (
    "id" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "DriverRef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleRef" (
    "id" INTEGER NOT NULL,
    "plate" TEXT,

    CONSTRAINT "VehicleRef_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Route_code_key" ON "Route"("code");

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "DriverRef"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "VehicleRef"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
