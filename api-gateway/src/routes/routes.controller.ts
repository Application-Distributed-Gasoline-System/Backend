import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { RoutesClientService } from './route-client.provider';
import { Roles } from 'src/auth/roles.decorator';
import { PaginationDto } from 'src/common';
import { firstValueFrom } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesClient: RoutesClientService) { }

  @Post()
  async create(@Body() createRouteDto: CreateRouteDto) {
    try {
      return await firstValueFrom(this.routesClient.createRoute(createRouteDto));
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get()
  @Roles('ADMIN')
  findAll(@Query() paginationDto: PaginationDto) {
    return firstValueFrom(this.routesClient.getAllRoutes(paginationDto));
  }

  @Get(':id')
  @Roles('ADMIN')
  async findOne(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.routesClient.getRouteById(Number(id)),
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Patch(':id')
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() updateRouteDto: UpdateRouteDto) {
    return firstValueFrom(
      this.routesClient.updateRoute({ id: Number(id), ...updateRouteDto }),
    );
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return firstValueFrom(this.routesClient.deleteRoute(Number(id)));
  }
}
