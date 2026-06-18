import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { sign } from 'jsonwebtoken';
import { AuthGuard, IS_PUBLIC_KEY, verifyJwt } from 'src/auth/auth.guard';
import { ROLES_KEY } from 'src/decorators/roles.decorator';

const TEST_SECRET = 'test-secret';

function signToken(payload: Record<string, any>, expiresIn = '1h'): string {
  return sign(payload, TEST_SECRET, { expiresIn } as any);
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockContext: ExecutionContext;
  let mockRequest: any;
  let reflector: Reflector;

  beforeEach(() => {
    process.env.JWT_SECRET = TEST_SECRET;
    reflector = new Reflector();
    guard = new AuthGuard(reflector);
    mockRequest = { headers: {}, url: '' };
    mockContext = {
      switchToHttp: () => ({ getRequest: () => mockRequest }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('allows access when the endpoint is public', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('throws Unauthorized when no token is provided', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('throws Unauthorized for an unsigned/tampered token', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      // Forged token built without the secret (alg: none style).
      const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString(
        'base64',
      );
      const body = Buffer.from(JSON.stringify({ sub: '1' })).toString('base64');
      mockRequest.headers.authorization = `Bearer ${header}.${body}.sig`;
      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('throws Unauthorized for an expired token', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const token = signToken({ sub: '1', role: 'admin' }, '-1s');
      mockRequest.headers.authorization = `Bearer ${token}`;
      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('populates request.user for a valid token with no roles required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === ROLES_KEY) return null;
        return undefined;
      });

      const token = signToken({
        sub: 'user-1',
        role: 'user',
        org_role: 'member',
        organization_id: 'org-1',
      });
      mockRequest.headers.authorization = `Bearer ${token}`;

      expect(guard.canActivate(mockContext)).toBe(true);
      expect(mockRequest.user.id).toBe('user-1');
      expect(mockRequest.user.role).toBe('user');
      expect(mockRequest.user.org_role).toBe('member');
      expect(mockRequest.user.organization_id).toBe('org-1');
    });

    it('allows access when the user holds a required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === ROLES_KEY) return ['admin'];
        return undefined;
      });

      const token = signToken({ sub: 'user-1', role: 'admin' });
      mockRequest.headers.authorization = `Bearer ${token}`;

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('throws Forbidden when the user lacks a required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === ROLES_KEY) return ['admin'];
        return undefined;
      });

      const token = signToken({ sub: 'user-1', role: 'user' });
      mockRequest.headers.authorization = `Bearer ${token}`;

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });
  });

  describe('verifyJwt', () => {
    it('returns the payload for a validly signed token', () => {
      const token = signToken({ sub: 'abc', role: 'admin' });
      const result = verifyJwt(token);
      expect(result.sub).toBe('abc');
      expect(result.role).toBe('admin');
    });

    it('throws Unauthorized for an invalid token', () => {
      expect(() => verifyJwt('invalid.token')).toThrow(UnauthorizedException);
    });
  });
});
