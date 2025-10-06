// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.Service'; 
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../generated/prisma';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {} 

  async findByEmail(email: string) {
    // Usamos 'user' que es el nombre del modelo
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(
    email: string,
    password: string,
    role: UserRole,
    name?: string, 
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        // El rol se pasa directamente ya que tiene el tipado correcto
        role: role
      },
    });
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}