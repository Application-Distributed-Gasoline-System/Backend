
import { Catch, ArgumentsHost, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { GrpcStatus } from './grpc-status.enum';

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter {
    catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const error = exception.getError() as any;

    // Transformar los codigo de exeption que manda el grcp y transformarlo a httpStatus
    const grpcToHttp: Record<number, number> = {
      [GrpcStatus.INVALID_ARGUMENT]: HttpStatus.BAD_REQUEST,
      [GrpcStatus.NOT_FOUND]: HttpStatus.NOT_FOUND,
      [GrpcStatus.ALREADY_EXISTS]: HttpStatus.CONFLICT,
      [GrpcStatus.PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
      [GrpcStatus.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
      [GrpcStatus.UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
      [GrpcStatus.INTERNAL]: HttpStatus.INTERNAL_SERVER_ERROR,
    };

    const status = grpcToHttp[error.code] ?? HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      message: error.message || 'Error interno no controlado',
    });
  }
}