import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthClientService } from './auth-client.provider';
import { firstValueFrom } from 'rxjs';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authClient: AuthClientService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const request = context.switchToHttp().getRequest();

    // 1. Extraer el token del encabezado 'Authorization'
    const authorizationHeader = request.headers['authorization'];

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Token de acceso Bearer no proporcionado.',
      );
    }

    const token = authorizationHeader.split(' ')[1];

    try {
      // 2. Llamar al microservicio gRPC para validar el token
      const validationResult = await firstValueFrom(
        this.authClient.validateToken({ token }), // Llama a tu método wrapper del gRPC
      );

      // 3. Verificar la validez
      if (!validationResult.valid) {
        throw new UnauthorizedException('Token de acceso inválido o expirado.');
      }

      // 4. (Opcional pero recomendado): Adjuntar los datos del usuario a la request
      // Esto permite que los controladores accedan a req.user (e.g., el userId, role)
      request['user'] = {
        userId: validationResult.userId,
        email: validationResult.email,
        role: validationResult.role,
      };

      return true; // Acceso permitido
    } catch (error) {
      // Manejar errores como gRPC fallido o token inválido
      // Si ya lanzamos una UnauthorizedException, la propagamos.
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Para cualquier otro error (ej. conexión gRPC), usamos un error genérico
      throw new UnauthorizedException('Fallo en la validación de la sesión.');
    }
  }
}
