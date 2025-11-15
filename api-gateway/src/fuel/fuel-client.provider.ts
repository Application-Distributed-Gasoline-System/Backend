import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { FUEL_PACKAGE } from 'src/config';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { ReportRequestDto } from './dto/report-request.dto';


export interface FuelServiceGrpc {
  CreateFuel(data: { record: any }): Observable<any>;
  GetByVehicle(data: { vehicleId: string; from?: string; to?: string }): Observable<any>;
  GetReport(data: ReportRequestDto): Observable<any>;
}

// ====== Cliente ======

@Injectable()
export class FuelClientService implements OnModuleInit {
  private fuelService: FuelServiceGrpc;

  constructor(
    @Inject(FUEL_PACKAGE) private readonly client: ClientGrpc
  ) { }

  onModuleInit() {
    this.fuelService = this.client.getService<FuelServiceGrpc>('FuelService');
  }

  createFuelRecord(dto: CreateFuelDto) {
    return this.fuelService.CreateFuel({ record: dto });
  }

  getFuelByVehicle(vehicleId: string, from?: string, to?: string) {
    return this.fuelService.GetByVehicle({ vehicleId, from, to });
  }
  getFuelReport(dto: ReportRequestDto) {
    return this.fuelService.GetReport(dto);
  }
}
