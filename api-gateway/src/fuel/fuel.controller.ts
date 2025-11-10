import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';
import { FuelClientService } from './fuel-client.provider';
import { firstValueFrom } from 'rxjs';

@Controller('fuel')
export class FuelController {
  constructor(private readonly fuelService: FuelClientService) { }

  @Post()
  create(@Body() createFuelDto: CreateFuelDto) {
    return firstValueFrom(this.fuelService.createFuelRecord(createFuelDto));
  }

  @Get()
  findAll() {

  }

  @Get(':id')
  findOne(@Param('id') id: string) {

  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFuelDto: UpdateFuelDto) {
    return firstValueFrom(
      this.fuelService.updateFuelRecord({ id, ...updateFuelDto })
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {

  }
}
