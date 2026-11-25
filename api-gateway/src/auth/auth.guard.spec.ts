import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { of } from 'rxjs';
import { AuthGuard } from './auth.guard';

describe('AuthGuard portfolio access', () => {
  const originalDemo = process.env.DEMO_EMAIL;
  const validateToken = jest.fn();
  const reflector = { getAllAndOverride: jest.fn(() => false) };
  const guard = new AuthGuard({ validateToken } as any, reflector as any);
  const context = (method = 'GET', path = '/api/vehicles') =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer valid' },
          method,
          path,
        }),
      }),
    }) as unknown as ExecutionContext;
  beforeEach(() => {
    process.env.DEMO_EMAIL = 'demo@fuelops.dayle.dev';
    reflector.getAllAndOverride.mockReturnValue(false);
    validateToken.mockReturnValue(
      of({
        valid: true,
        email: process.env.DEMO_EMAIL,
        role: 'ADMIN',
        userId: 'demo',
      }),
    );
  });
  afterAll(() => {
    if (originalDemo === undefined) delete process.env.DEMO_EMAIL;
    else process.env.DEMO_EMAIL = originalDemo;
  });
  it('allows public routes such as refresh without an access token', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    await expect(
      guard.canActivate(context('POST', '/api/auth/refresh')),
    ).resolves.toBe(true);
  });
  it('allows visitors to inspect demo data', async () => {
    await expect(guard.canActivate(context())).resolves.toBe(true);
  });
  it.each(['POST', 'PATCH', 'PUT', 'DELETE'])(
    'rejects %s writes even though the demo has the admin view',
    async (method) => {
      await expect(guard.canActivate(context(method))).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    },
  );
  it('allows a demo visitor to sign out', async () => {
    await expect(
      guard.canActivate(context('POST', '/api/auth/logout')),
    ).resolves.toBe(true);
  });
  it('protects the seeded public demo even when DEMO_EMAIL is not configured', async () => {
    delete process.env.DEMO_EMAIL;
    await expect(guard.canActivate(context('POST'))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
  it('protects the seeded public demo even when an additional demo email is configured', async () => {
    process.env.DEMO_EMAIL = 'another-demo@example.test';
    await expect(guard.canActivate(context('POST'))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
  it('preserves write access for the private administrator', async () => {
    validateToken.mockReturnValue(
      of({ valid: true, email: 'admin@fuelops.dayle.dev', role: 'ADMIN' }),
    );
    await expect(guard.canActivate(context('POST'))).resolves.toBe(true);
  });
  it('rejects invalid sessions', async () => {
    validateToken.mockReturnValue(of({ valid: false }));
    await expect(guard.canActivate(context())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
