import { Controller } from '@nestjs/common';
import { EventPattern, GrpcMethod, Payload } from '@nestjs/microservices';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { PaginationDto } from 'src/common';

@Controller()
export class RoutesController {
  constructor(private readonly routesService: RoutesService) { }

  ///////// NATS ///////////

  //VEHICLES
  @EventPattern('vehicle.created')
  async handleVehicleCreated(@Payload() data) {
    await this.routesService.createVehicleRef(data);
  }

  @EventPattern('vehicle.updated')
  async handleVehicleUpdated(@Payload() data) {
    await this.routesService.updateVehicleRef(data);
  }

  @EventPattern('vehicle.deleted')
  async handleVehicleDeleted(@Payload() data: { id: number }) {
    await this.routesService.deleteVehicleRef(data.id);
  }



  // DRIVERS
  @EventPattern('drivers.driver.created')
  async handleDriverCreated(@Payload() data) {
    await this.routesService.createDriverRef(data);
  }

  @EventPattern('drivers.driver.update')
  async handleDriverUpdated(@Payload() data) {
    await this.routesService.updateDriverRef(data);
  }

  @EventPattern('drivers.driver.delete')
  async handleDriverDeleted(@Payload() data) {
    await this.routesService.deleteDriverRef(data.id);
  }

  @EventPattern('drivers.driver.name.updated')
  async handleDriverNameUpdated(@Payload() data: { id: string; name: string }) {
    await this.routesService.updateDriverNameRef(data);
  }

  @EventPattern('drivers.driver.availability.updated')
  async handleDriverStatusUpdated(@Payload() data: { id: string; isAvailable: boolean }) {
    await this.routesService.updateDriverStatusRef(data);
  }



  ////// Metodos del microservicio de  rutas /////

  @GrpcMethod('RouteService', 'CreateRoute')
  async createRoute(createRouteDto: CreateRouteDto) {
    const route = await this.routesService.createRoute(createRouteDto);
    return { ...route, message: 'Creado' };
  }

  @GrpcMethod('RouteService', 'GetAllRoutes')
  async findAllRoutes(data: PaginationDto) {
    const response = await this.routesService.findAllRoutes(data);
    return {
      routes: response.routes,
      total: response.total,
      page: response.page,
      totalPages: response.totalPages,
    };
  }

  @GrpcMethod('RouteService', 'GetRouteById')
  async findOneRoute(data: { id: number }) {
    const route = await this.routesService.findOneRoute(data.id);
    return (
      route || { id: '', name: '', license: '', message: 'No encontrado' }
    );
  }

  @GrpcMethod('RouteService', 'UpdateRoute')
  async updateRoute(updateRouteDto: UpdateRouteDto & { id: number }) {
    console.log('Payload recibido en microservicio gRPC:', updateRouteDto);
    const route = await this.routesService.updateRoute(updateRouteDto.id, updateRouteDto);
    return route
      ? { ...route, message: 'Actualizado' }
      : { id: '', name: '', license: '', message: 'No encontrado' };
  }

  @GrpcMethod('RouteService', 'DeleteRoute')
  async removeRoute(data: { id: number }) {
    const route = await this.routesService.removeRoute(data.id);
    return route
      ? { ...route, message: 'Eliminado' }
      : { id: '', name: '', license: '', message: 'No encontrado' };
  }
}
