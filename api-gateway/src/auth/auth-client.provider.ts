import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

// Define la interfaz de los métodos gRPC que vas a consumir
interface AuthServiceClient {
  Register(data: any): Observable<any>;
  Login(data: any): Observable<any>;
  RefreshToken(data: any): Observable<any>;
  RequestPasswordReset(data: any): Observable<any>;
  ResetPassword(data: any): Observable<any>;
  RevokeToken(data: any): Observable<any>;
  ValidateToken(data: any): Observable<any>;
  setUserActiveStatus(data: { userId: string; active: boolean }): Observable<any>;
  GetAllUsers(data: any): Observable<any>;
  UpdateUser(data: any): Observable<any>;
}

@Injectable()
export class AuthClientService implements OnModuleInit {
  private authService: AuthServiceClient;

  constructor(@Inject('AUTH_PACKAGE') private client: ClientGrpc) { }

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>('AuthService');
  }

  register(data: any) {
    return this.authService.Register(data);
  }
  login(data: any) {
    return this.authService.Login(data);
  }
  refreshToken(data: any) {
    return this.authService.RefreshToken(data);
  }
  requestPasswordReset(data: any) {
    return this.authService.RequestPasswordReset(data);
  }
  resetPassword(data: any) {
    return this.authService.ResetPassword(data);
  }
  revokeToken(data: any) {
    return this.authService.RevokeToken(data);
  }
  validateToken(data: any) {
    return this.authService.ValidateToken(data);
  }
  setUserActiveStatus(data: { userId: string; active: boolean }) {
    return this.authService.setUserActiveStatus(data);
  }
  getAllUsers() {
    return this.authService.GetAllUsers({});
  }
  updateUser(data: any) {
    return this.authService.UpdateUser(data);
  }
}
