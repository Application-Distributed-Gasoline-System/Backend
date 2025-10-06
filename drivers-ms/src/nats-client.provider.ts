import { ClientProxyFactory, Transport, ClientProxy } from '@nestjs/microservices';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class NatsClient implements OnModuleInit {
  private client: ClientProxy;

  onModuleInit() {
    this.client = ClientProxyFactory.create({
      transport: Transport.NATS,
      options: { url: 'nats://<tu-servidor-synadia>.nats.io:4222' /*'nats://localhost:4222'*/ }, // Aqui debo levantar un conedor que ejecute nats en esta direccion 
    });
  }

  emit(event: string, data: any) {
    return this.client.emit(event, data).toPromise();
  }
}