import { FuelService } from './fuel.service';

describe('Fuel report consistency', () => {
  it('includes the whole final day and fetches vehicle references once per report', async () => {
    const record = {
      id: 'record',
      vehicleId: '1',
      liters: 12,
      distanceKm: 100,
      estimatedFuelL: 10,
      deltaPercent: 20,
    };
    const prisma = {
      fuelRecord: { findMany: jest.fn().mockResolvedValue([record, record]) },
      vehicleRef: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: '1', averageConsumption: 10 }]),
      },
    };
    const service = new FuelService(prisma as any);
    const result = await service.getReport({
      from: '2026-11-01',
      to: '2026-11-25',
    });
    const where = prisma.fuelRecord.findMany.mock.calls[0][0].where;
    expect(where.recordedAt.gte.getHours()).toBe(0);
    expect(where.recordedAt.lte.getHours()).toBe(23);
    expect(where.recordedAt.lte.getMinutes()).toBe(59);
    expect(where.recordedAt.lte.getSeconds()).toBe(59);
    expect(prisma.vehicleRef.findMany).toHaveBeenCalledTimes(1);
    expect(result[0]).toMatchObject({
      totalLiters: 24,
      recordsCount: 2,
      avgLitersPerKm: 0.12,
    });
  });
});
