import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern, Payload } from '@nestjs/microservices';
import { FuelService } from './fuel.service';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';

@Controller()
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}


  @GrpcMethod('FuelService', 'CreateFuelRecord')
  async createFuelRecord(data: CreateFuelDto) {
    const fuel = await this.fuelService.createFuel(data);
    return { ...fuel, message: 'Creado' };
  }

  @MessagePattern('createFuel')
  create(@Payload() createFuelDto: CreateFuelDto) {
    // return this.fuelService.create(createFuelDto);
  }

  @MessagePattern('findAllFuel')
  findAll() {
    // return this.fuelService.findAll();
  }

  @MessagePattern('findOneFuel')
  findOne(@Payload() id: number) {
    // return this.fuelService.findOne(id);
  }

  @GrpcMethod('FuelService', 'UpdateFuelRecord')
  async updateFuelRecord(data: UpdateFuelDto & { id: string }) {
    const fuel = await this.fuelService.updateFuelRecord(data.id, data);
    return { ...fuel, message: 'Actualizado' }
  }
  @MessagePattern('removeFuel')
  remove(@Payload() id: number) {
    // return this.fuelService.remove(id);
  }
}
