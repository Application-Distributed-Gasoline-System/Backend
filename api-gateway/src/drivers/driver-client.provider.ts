import { ClientOptions } from '@grpc/grpc-js';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import{ Transport, type ClientGrpc } from '@nestjs/microservices';
import type { Observable } from 'rxjs';;

export interface DriversService {
  GetAllDrivers(data: {}): Observable<{ drivers: any[] }>;
  GetDriverById(data: { id: string }): Observable<any>;
  CreateDriver(data: { name: string; license: string }): Observable<any>;
  UpdateDriver(data: { id: string; name: string; license: string }): Observable<any>;
  DeleteDriver(data: { id: string }): Observable<any>;
}

@Injectable()
export class DriversClientService implements OnModuleInit {
  private driversService: DriversService;

  constructor(@Inject('DRIVERS_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.driversService = this.client.getService<DriversService>('DriversService');
  }

  getAllDrivers() {
    return this.driversService.GetAllDrivers({});
  }

  getDriverById(id: string) {
    return this.driversService.GetDriverById({ id });
  }

  createDriver(data: { name: string; license: string }) {
    return this.driversService.CreateDriver(data);
  }

  updateDriver(data: { id: string; name: string; license: string }) {
    return this.driversService.UpdateDriver(data);
  }

  deleteDriver(id: string) {
    return this.driversService.DeleteDriver({ id });
  }
}

