import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { GrpcStatus, PaginationDto } from 'src/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Injectable()
export class DriversService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('DriversService');

  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('La base de datos esta conectada');
  }

  async getAllDrivers(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.driver.findMany({
        skip,
        take: limit,
        //orderBy: { createdAt: 'desc'},
      }),
      this.driver.count(),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDriverById(id: string) {
    const driver = await this.driver.findUnique({ where: { id } });

    if (!driver)
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: `Driver with id: ${id} not found`,
      });

    return driver;
  }

  async createDriver(data: CreateDriverDto) {
    const driver = this.driver.create({ data });
    //await this.natsClient.emit('driver.created', driver); // <--- evento NATS de crear
    // Si no ocurre ningun error mientras hace lo que tenga que hacer el microservicio retorna los conductores
    return driver;
  }

  async createFromAuth(data: { userId: string; email: string; name: string }) {
    this.logger.log(`Creando driver desde Auth: ${JSON.stringify(data)}`);

    const existing = await this.driver.findUnique({
      where: { userId: data.userId },
    });

    if (existing) {
      this.logger.warn(`El driver con userId ${data.userId} ya existe`);
      return existing;
    }

    const driver = await this.driver.create({
      data: {
        userId: data.userId,
        name: data.name,
      },
    });

    this.logger.log(`Driver creado: ${driver.id}`);
    return driver;
  }

  async updateDriver(id: string, data: UpdateDriverDto) {
    const driver = this.driver.update({ where: { id }, data });
    //await this.natsClient.emit('driver.update', driver); // <--- evento NATS de actualizar
    return driver; // Si no ocurre ningun error mientras hace lo que tenga que hacer el microservicio retorna los conductores
  }

  async deleteDriver(id: string) {
    const driver = await this.driver.findUnique({ where: { id } });

    if (!driver)
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: `Driver with id: ${id} not found`,
      });

    //await this.natsClient.emit('driver.delete', driver); // <--- evento NATS de actualizar
    return this.driver.delete({ where: { id } }); // Si no ocurre ningun error mientras hace lo que tenga que hacer el microservicio retorna los conductores
  }
}
