import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import{ Transport, type ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

export interface VehiclesService {
  GetAllVehicles(data: {}): Observable<{ vehicles: any[] }>;
  GetVehicleById(data: { id: number }): Observable<any>;
  CreateVehicle(data: { vehicle: any }): Observable<any>;
  UpdateVehicle(data: { vehicle: any }): Observable<any>;
  DeleteVehicle(data: { id: number }): Observable<any>;
}

@Injectable()
export class VehiclesClientService implements OnModuleInit {
  private vehiclesService: VehiclesService;

  constructor(@Inject('VEHICLES_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.vehiclesService = this.client.getService<VehiclesService>('VehiclesService');
  }

  getAllVehicles() {
    return this.vehiclesService.GetAllVehicles({});
  }

  getVehicleById(id: number) {
    return this.vehiclesService.GetVehicleById({ id });
  }

  createVehicle(vehicle: any) {
    return this.vehiclesService.CreateVehicle({ vehicle });
  }

  updateVehicle(vehicle: any) {
    return this.vehiclesService.UpdateVehicle({ vehicle });
  }

  deleteVehicle(id: number) {
    return this.vehiclesService.DeleteVehicle({ id });
  }
}
