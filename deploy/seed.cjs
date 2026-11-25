// Synthetic portfolio data. No real people, trips, or fuel transactions.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const service = process.env.SERVICE;
const uid = (n) => `f0e10000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const ago = (days, hour = 10) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(hour, 0, 0, 0);
  return date;
};
const names = [
  "Valentina Torres",
  "Mateo Rivera",
  "Camila Paredes",
  "Nicolás Vega",
  "Isabella Mora",
  "Daniel Salazar",
  "Emilia Andrade",
  "Samuel Cevallos",
];
const drivers = names.map((name, i) => ({
  id: uid(i + 1),
  userId: uid(i + 101),
  name,
  email: `conductor${i + 1}@example.test`,
  license: i % 2 ? "E" : "C",
  isAvailable: i !== 7,
}));
const models = [
  ["Toyota", "Hilux", "LIGHT", 9.4],
  ["Chevrolet", "D-Max", "LIGHT", 10.8],
  ["Hino", "500", "HEAVY", 25.6],
  ["Isuzu", "NPR", "HEAVY", 21.3],
  ["Ford", "Ranger", "LIGHT", 10.2],
  ["Toyota", "Fortuner", "LIGHT", 11.4],
  ["Mercedes-Benz", "Atego", "HEAVY", 27.8],
  ["Foton", "Aumark", "HEAVY", 22.1],
  ["Nissan", "Frontier", "LIGHT", 10.1],
  ["Chevrolet", "N300", "LIGHT", 8.7],
  ["Hyundai", "HD78", "HEAVY", 19.6],
  ["Kia", "K2700", "LIGHT", 9.8],
];
const vehicles = models.map(
  ([brand, model, machineryType, averageConsumption], i) => ({
    id: i + 1,
    plate: `DEMO-${String(i + 1).padStart(3, "0")}`,
    brand,
    model,
    year: 2020 + (i % 5),
    engineType: "DIESEL",
    machineryType,
    tankCapacity: machineryType === "HEAVY" ? 160 : 80,
    engineDisplacement: machineryType === "HEAVY" ? 5.2 : 2.8,
    averageConsumption,
    mileage: 18420 + i * 6373,
    available: ![6, 10].includes(i),
    status:
      i === 10
        ? "UNDER_MAINTENANCE"
        : i === 6
          ? "OUT_OF_SERVICE"
          : "OPERATIONAL",
  }),
);
const journeys = [
  ["Ambato, Ecuador", "Quito, Ecuador", 151.7],
  ["Ambato, Ecuador", "Riobamba, Ecuador", 56.4],
  ["Latacunga, Ecuador", "Ambato, Ecuador", 43.8],
  ["Quito, Ecuador", "Ibarra, Ecuador", 114.2],
  ["Ambato, Ecuador", "Baños, Ecuador", 42.6],
  ["Riobamba, Ecuador", "Cuenca, Ecuador", 255.3],
  ["Quito, Ecuador", "Santo Domingo, Ecuador", 151.9],
  ["Ambato, Ecuador", "Guayaquil, Ecuador", 279.4],
];
const routes = Array.from({ length: 96 }, (_, i) => {
  const vehicle = vehicles[i % vehicles.length];
  const driver =
    drivers[vehicle.machineryType === "HEAVY" ? (i % 4) * 2 + 1 : i % 8];
  const [origin, destination, distanceKm] = journeys[i % journeys.length];
  const status =
    i >= 93
      ? "IN_PROGRESS"
      : i >= 88
        ? "PLANNED"
        : i % 13 === 0
          ? "CANCELLED"
          : "COMPLETED";
  const estimatedFuelL = +(
    (distanceKm * vehicle.averageConsumption) /
    100
  ).toFixed(2);
  return {
    id: i + 1,
    code: `FO-${String(i + 1).padStart(4, "0")}`,
    origin,
    destination,
    distanceKm,
    machineryType: vehicle.machineryType,
    driverId: driver.id,
    vehicleId: vehicle.id,
    status,
    estimatedFuelL,
    actualFuelL:
      status === "COMPLETED"
        ? +(estimatedFuelL * (0.96 + (i % 7) * 0.018)).toFixed(2)
        : null,
    scheduledAt: ago(i >= 88 ? 0 : 60 - Math.floor(i * 0.65)),
    startedAt: ["COMPLETED", "IN_PROGRESS"].includes(status)
      ? ago(i >= 93 ? 0 : 60 - Math.floor(i * 0.65), 11)
      : null,
    completedAt:
      status === "COMPLETED" ? ago(60 - Math.floor(i * 0.65), 15) : null,
  };
});
async function main() {
  if (service === "auth-ms") {
    const bcrypt = require("bcrypt");
    if (!process.env.ADMIN_PASSWORD)
      throw new Error("ADMIN_PASSWORD is required for the initial seed");
    const accounts = [
      {
        id: uid(1000),
        email: process.env.ADMIN_EMAIL || "admin@fuelops.dayle.dev",
        name: "Administrador FuelOps",
        role: "ADMIN",
        password: process.env.ADMIN_PASSWORD,
      },
      {
        id: uid(1001),
        email: "demo@fuelops.dayle.dev",
        name: "Visitante demo",
        role: "ADMIN",
        password: "FuelOps.Demo.2026",
      },
      ...drivers.map((driver) => ({
        id: driver.userId,
        email: driver.email,
        name: driver.name,
        role: "DRIVER",
        password: process.env.ADMIN_PASSWORD,
      })),
    ];
    for (const account of accounts) {
      const { password, ...data } = account;
      await prisma.user.upsert({
        where: { email: data.email },
        create: { ...data, password: await bcrypt.hash(password, 12) },
        update: {},
      });
    }
    console.log(`Seeded ${accounts.length} synthetic user accounts`);
  } else if (service === "drivers-ms") {
    for (const driver of drivers)
      await prisma.driver.upsert({
        where: { id: driver.id },
        create: driver,
        update: {},
      });
    console.log(`Seeded ${drivers.length} drivers`);
  } else if (service === "vehicles-ms") {
    for (const vehicle of vehicles)
      await prisma.vehicle.upsert({
        where: { id: vehicle.id },
        create: vehicle,
        update: {},
      });
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('vehicles', 'id'), GREATEST((SELECT MAX(id) FROM vehicles), 1))`,
    );
    console.log(`Seeded ${vehicles.length} vehicles`);
  } else if (service === "routes-ms") {
    for (const driver of drivers) {
      const { id, name, license, isAvailable } = driver;
      await prisma.driverRef.upsert({
        where: { id },
        create: { id, name, license, isAvailable },
        update: {},
      });
    }
    for (const vehicle of vehicles) {
      const { brand, model, year, registrationDate, ...data } = vehicle;
      await prisma.vehicleRef.upsert({
        where: { id: data.id },
        create: data,
        update: {},
      });
    }
    for (const route of routes)
      await prisma.route.upsert({
        where: { id: route.id },
        create: route,
        update: {},
      });
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"Route"', 'id'), GREATEST((SELECT MAX(id) FROM "Route"), 1))`,
    );
    console.log(`Seeded ${routes.length} routes with synchronized references`);
  } else if (service === "fuel-ms") {
    for (const vehicle of vehicles) {
      const data = {
        id: String(vehicle.id),
        plate: vehicle.plate,
        averageConsumption: vehicle.averageConsumption,
        engineType: vehicle.engineType,
        machineryType: vehicle.machineryType,
      };
      await prisma.vehicleRef.upsert({
        where: { id: data.id },
        create: data,
        update: {},
      });
    }
    for (let i = 0; i < 720; i++) {
      const vehicle = vehicles[i % vehicles.length];
      const route = routes[i % routes.length];
      const daysAgo = Math.floor(i / 8);
      const distanceKm = +(
        58.4 +
        ((i * 37) % 239) +
        Math.sin(i * 0.7) * 8
      ).toFixed(1);
      const estimatedFuelL = +(
        (distanceKm * vehicle.averageConsumption) /
        100
      ).toFixed(2);
      const factor = i % 41 === 0 ? 1.42 : 0.93 + (i % 17) * 0.011;
      const liters = +(estimatedFuelL * factor).toFixed(2);
      const data = {
        id: (0xf0e100000000000000000000n + BigInt(i)).toString(16),
        externalId: `portfolio-demo-${i}`,
        vehicleId: String(vehicle.id),
        driverId: drivers[i % drivers.length].id,
        routeId: String(route.id),
        routeCode: route.code,
        liters,
        estimatedFuelL,
        distanceKm,
        deltaPercent: +(
          ((liters - estimatedFuelL) / estimatedFuelL) *
          100
        ).toFixed(2),
        fuelType: vehicle.engineType,
        machineryType: vehicle.machineryType,
        source: "manual",
        odometer: vehicle.mileage + (90 - daysAgo) * 120,
        recordedAt: ago(daysAgo, 8 + (i % 10)),
        createdAt: ago(daysAgo, 8 + (i % 10)),
      };
      await prisma.fuelRecord.upsert({
        where: { id: data.id },
        create: data,
        update: {},
      });
    }
    console.log("Seeded 720 fuel records across 90 days");
  } else throw new Error(`Unknown SERVICE: ${service}`);
}
main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
