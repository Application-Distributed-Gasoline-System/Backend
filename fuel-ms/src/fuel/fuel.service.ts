import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFuelDto, FuelSource } from './dto/create-fuel.dto';

@Injectable()
export class FuelService {
  private readonly logger = new Logger(FuelService.name);
  private readonly ANOMALY_THRESHOLD_PERCENT = Number(process.env.FUEL_ANOMALY_THRESHOLD ?? 30);

  constructor(private prisma: PrismaService) { }

  private computeDelta(liters: number, estimated?: number): number | null {
    if (estimated == null || estimated === 0) return null;
    return ((liters - estimated) / estimated) * 100;
  }

  private normalizeDate(s?: string) {
    if (!s) return new Date();
    const date = new Date(s);
    return isNaN(date.getTime()) ? new Date() : date;
  }

  private normalizeSource(s?: string) {
    if (!s) return FuelSource.MANUAL;
    const lower = s.toString().toLowerCase();
    if (Object.values(FuelSource).includes(lower as FuelSource)) {
      return lower as FuelSource;
    }
    return FuelSource.MANUAL;
  }

  async syncVehicleRef(data: any) {
    try {
      const vehicleId = data.id.toString();
      await this.prisma.vehicleRef.upsert({
        where: { id: vehicleId },
        create: {
          id: vehicleId,
          plate: data.plate,
          averageConsumption: data.averageConsumption ? Number(data.averageConsumption) : 0,
          engineType: data.engineType,
          machineryType: data.machineryType
        },
        update: {
          plate: data.plate,
          averageConsumption: data.averageConsumption ? Number(data.averageConsumption) : 0,
          engineType: data.engineType,
          machineryType: data.machineryType
        }
      });
      this.logger.log(`🚜 VehicleRef sincronizado: ${data.plate}`);
    } catch (error) {
      this.logger.error(`Error sincronizando VehicleRef: ${error.message}`);
    }
  }

  async deleteVehicleRef(id: number) {
    try {
      const vehicleId = id.toString();
      const exists = await this.prisma.vehicleRef.findUnique({ where: { id: vehicleId } });
      if (exists) {
        await this.prisma.vehicleRef.delete({ where: { id: vehicleId } });
        this.logger.log(`🚜 VehicleRef eliminado: ${id}`);
      }
    } catch (error) {
      this.logger.error(`Error eliminando VehicleRef: ${error.message}`);
    }
  }

  async createRecord(dto: CreateFuelDto) {
    // 1. Idempotencia
    if (dto.externalId) {
      const existing = await this.prisma.fuelRecord.findFirst({ where: { externalId: dto.externalId } });
      if (existing) {
        this.logger.warn(`Registro ya procesado (externalId=${dto.externalId})`);
        return { record: existing, isAnomaly: false, message: 'Registro duplicado' };
      }
    }
    const vehicleRef = await this.prisma.vehicleRef.findUnique({
      where: { id: dto.vehicleId }
    });

    const finalFuelType = vehicleRef?.engineType ?? 'diesel';
    const finalMachineryType = vehicleRef?.machineryType ?? 'HEAVY';

    let estimatedFuel = dto.estimatedFuelL;
    let distance = dto.distanceKm;

    if (this.normalizeSource(dto.source) === FuelSource.MANUAL && dto.odometer && !estimatedFuel) {

      // Buscamos el último registro que TENGA odómetro
      const lastRecord = await this.prisma.fuelRecord.findFirst({
        where: {
          vehicleId: dto.vehicleId,
          odometer: { not: null }
        },
        orderBy: { recordedAt: 'desc' }
      });

      const vehicleRef = await this.prisma.vehicleRef.findUnique({
        where: { id: dto.vehicleId }
      });

      if (lastRecord && lastRecord.odometer !== null && vehicleRef && vehicleRef.averageConsumption) {

        const currentOdo = dto.odometer;
        const previousOdo = lastRecord.odometer;

        if (currentOdo > previousOdo) {
          distance = currentOdo - previousOdo;
          estimatedFuel = (distance / 100) * vehicleRef.averageConsumption;
          this.logger.log(`🤖 Cálculo Automático: ${distance}km recorridos. Estimado: ${estimatedFuel.toFixed(2)}L`);
        } else {
          this.logger.warn(`⚠️ Odómetro menor al anterior (${previousOdo}).`);
        }
      }
    }

    const recordedAt = this.normalizeDate(dto.recordedAt);
    const delta = this.computeDelta(dto.liters, estimatedFuel);

    const created = await this.prisma.fuelRecord.create({
      data: {
        externalId: dto.externalId,
        driverId: dto.driverId,
        vehicleId: dto.vehicleId,
        routeId: dto.routeId ?? null,
        routeCode: dto.routeCode,
        liters: dto.liters,
        fuelType: finalFuelType,
        machineryType: finalMachineryType as any,
        odometer: dto.odometer ?? null,
        gpsLocation: dto.gpsLocation ?? null,
        source: this.normalizeSource(dto.source as any),
        estimatedFuelL: estimatedFuel ?? null,
        distanceKm: distance ?? null,
        deltaPercent: delta,
        recordedAt,
      }
    });

    let isAnomaly = false;
    let anomalyMessage: string | null = null;

    if (delta !== null && Math.abs(delta) >= this.ANOMALY_THRESHOLD_PERCENT) {
      isAnomaly = true;
      anomalyMessage = `⚠️ ANOMALÍA: El consumo difiere un ${delta.toFixed(2)}% del estimado.`;
      this.logger.warn(`[FuelService] ${anomalyMessage} (ID: ${created.id})`);
    }

    return {
      record: created,
      isAnomaly,
      message: isAnomaly ? anomalyMessage : 'Registro creado correctamente'
    };
  }

  async getByVehicle(vehicleId: string, from?: string, to?: string) {
    const where: any = { vehicleId };
    if (from || to) {
      where.recordedAt = {};
      if (from) where.recordedAt.gte = new Date(from);
      if (to) where.recordedAt.lte = new Date(to);
    }

    const records = await this.prisma.fuelRecord.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
    });

    return records.map(r => ({
      ...r,
      isAnomaly: r.deltaPercent !== null && Math.abs(r.deltaPercent) >= this.ANOMALY_THRESHOLD_PERCENT,
      anomalyInfo: r.deltaPercent !== null
        ? {
          deltaPercent: r.deltaPercent,
          liters: r.liters,
          estimatedFuelL: r.estimatedFuelL,
          distanceKm: r.distanceKm,
        }
        : null,
    }));
  }


  async getReport({ from, to, vehicleIds, machineryType }: { from: string; to: string; vehicleIds?: string[]; machineryType?: string }) {
    const where: any = {};
    if (from || to) {
      where.recordedAt = {};
      if (from) where.recordedAt.gte = new Date(from);
      if (to) where.recordedAt.lte = new Date(to);
    }
    if (vehicleIds && vehicleIds.length) where.vehicleId = { in: vehicleIds };
    if (machineryType) where.machineryType = machineryType;

    const records = await this.prisma.fuelRecord.findMany({ where });

    const map = new Map<
      string,
      { totalLiters: number; totalKm: number; count: number; anomalies: number; anomalyRecords: any[] }
    >();

    for (const r of records) {
      const v = map.get(r.vehicleId) ?? { totalLiters: 0, totalKm: 0, count: 0, anomalies: 0, anomalyRecords: [] };

      v.totalLiters += r.liters ?? 0;
      v.totalKm += r.distanceKm ?? 0;
      v.count += 1;

      if (r.deltaPercent !== null && r.deltaPercent !== undefined && Math.abs(r.deltaPercent) >= this.ANOMALY_THRESHOLD_PERCENT) {
        v.anomalies += 1;
        v.anomalyRecords.push({
          recordId: r.id,
          deltaPercent: r.deltaPercent,
          liters: r.liters,
          estimatedFuelL: r.estimatedFuelL,
          distanceKm: r.distanceKm,
          recordedAt: r.recordedAt,
        });
      }

      map.set(r.vehicleId, v);
    }

    return Array.from(map.entries()).map(([vehicleId, agg]) => ({
      vehicleId,
      totalLiters: agg.totalLiters,
      avgLitersPerKm: agg.totalKm ? agg.totalLiters / agg.totalKm : 0,
      recordsCount: agg.count,
      anomaliesDetected: agg.anomalies,
      anomalyRecords: agg.anomalyRecords,
    }));

  }
}