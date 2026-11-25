jest.mock('src/config', () => ({
  envs: {
    jwt_secret: 'test-key-only',
    jwt_expires_in: 3600,
    refres_token_expires_days: 30,
    reset_token_expires_hours: 1,
  },
}));
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService session lifecycle', () => {
  let service: AuthService;
  let users: any;
  let prisma: any;
  let transaction: any;
  const user = {
    id: 'user-1',
    email: 'driver@example.test',
    role: 'DRIVER',
    active: true,
    password: 'hash',
  };
  beforeEach(() => {
    users = {
      findByEmail: jest.fn().mockResolvedValue(user),
      findById: jest.fn().mockResolvedValue(user),
      validatePassword: jest.fn().mockResolvedValue(true),
    };
    transaction = {
      refreshToken: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        create: jest.fn().mockResolvedValue({}),
      },
    };
    prisma = {
      refreshToken: {
        findUnique: jest
          .fn()
          .mockResolvedValue({
            id: 1,
            userId: user.id,
            revoked: false,
            createdAt: new Date(),
          }),
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(transaction)),
    };
    service = new AuthService(users, prisma, {} as any, {} as any);
  });
  it('does not authenticate a deactivated user', async () => {
    users.findByEmail.mockResolvedValue({ ...user, active: false });
    await expect(service.login(user.email, 'password')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
  it('rejects refresh tokens older than the configured lifetime', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 1,
      userId: user.id,
      revoked: false,
      createdAt: new Date(Date.now() - 31 * 86400000),
    });
    await expect(service.refreshToken('old-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
  it('rejects refresh for a deactivated user', async () => {
    users.findById.mockResolvedValue({ ...user, active: false });
    await expect(service.refreshToken('token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
  it('rotates a valid refresh token atomically', async () => {
    const response = await service.refreshToken('token');
    expect(response.accessToken).toBeTruthy();
    expect(response.refreshToken).toBeTruthy();
    expect(transaction.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { id: 1, revoked: false },
      data: { revoked: true },
    });
    expect(transaction.refreshToken.create).toHaveBeenCalledTimes(1);
  });
  it('rejects a concurrent replay without issuing another token', async () => {
    transaction.refreshToken.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.refreshToken('already-consumed'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(transaction.refreshToken.create).not.toHaveBeenCalled();
  });
  it('validates the current database role rather than an outdated token role', async () => {
    users.findById.mockResolvedValue({ ...user, role: 'DISPATCHER' });
    const result = await service.validateAccessToken(
      service.signPayload({
        sub: user.id,
        email: 'old@example.test',
        role: 'ADMIN',
      }),
    );
    expect(result.user).toMatchObject({
      email: user.email,
      role: 'DISPATCHER',
    });
  });
  it('invalidates existing access for a deactivated user', async () => {
    users.findById.mockResolvedValue({ ...user, active: false });
    const result = await service.validateAccessToken(
      service.signPayload({ sub: user.id }),
    );
    expect(result.valid).toBe(false);
  });
});
