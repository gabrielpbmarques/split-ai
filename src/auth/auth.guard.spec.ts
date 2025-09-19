import {
  ForbiddenException,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard, parseJwt, IS_PUBLIC_KEY } from 'src/auth/auth.guard';
import { ROLES_KEY } from 'src/decorators/roles.decorator';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockContext: any;
  let mockRequest: any;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new AuthGuard(reflector);
    mockRequest = {
      headers: {},
      url: '',
    };
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access if endpoint is marked as public', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should proceed with authorization if endpoint is not public and no roles required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === ROLES_KEY) return null; // Sem roles requeridas
        return undefined;
      });

      const payload = { type: 'establishment' };
      const token = generateMockJwt(payload);
      mockRequest.headers.authorization = `Bearer ${token}`;

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });
    it('should throw UnauthorizedException when no token is provided', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      mockRequest.headers.authorization = undefined;

      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid token format', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      mockRequest.headers.authorization = 'Bearer invalid';

      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('should allow access to token endpoint for establishment users', () => {
      // Primeiro mock para IS_PUBLIC_KEY, depois para ROLES_KEY
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === ROLES_KEY) return ['establishment', 'company'];
        return undefined;
      });

      const payload = { type: 'establishment' };
      const token = generateMockJwt(payload);
      mockRequest.headers.authorization = `Bearer ${token}`;
      mockRequest.url = '/token';

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockRequest.user).toEqual(payload);
    });

    it('should allow access to token endpoint for company users', () => {
      // Primeiro mock para IS_PUBLIC_KEY, depois para ROLES_KEY
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === ROLES_KEY) return ['establishment', 'company'];
        return undefined;
      });

      const payload = { type: 'company' };
      const token = generateMockJwt(payload);
      mockRequest.headers.authorization = `Bearer ${token}`;
      mockRequest.url = '/token';

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockRequest.user).toEqual(payload);
    });

    it('should throw ForbiddenException for worker user accessing token endpoint', () => {
      // Primeiro mock para IS_PUBLIC_KEY
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === ROLES_KEY) return ['establishment', 'company'];
        return undefined;
      });

      const payload = { type: 'worker' };
      const token = generateMockJwt(payload);
      mockRequest.headers.authorization = `Bearer ${token}`;
      mockRequest.url = '/token';

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should allow access to validate-token endpoint for worker users', () => {
      // Primeiro mock para IS_PUBLIC_KEY, depois para ROLES_KEY
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === ROLES_KEY) return ['worker'];
        return undefined;
      });

      const payload = { type: 'worker' };
      const token = generateMockJwt(payload);
      mockRequest.headers.authorization = `Bearer ${token}`;
      mockRequest.url = '/validate-token';

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockRequest.user).toEqual(payload);
    });

    it('should throw ForbiddenException for establishment user accessing validate-token endpoint', () => {
      // Primeiro mock para IS_PUBLIC_KEY, depois para ROLES_KEY
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === ROLES_KEY) return ['worker'];
        return undefined;
      });

      const payload = { type: 'establishment' };
      const token = generateMockJwt(payload);
      mockRequest.headers.authorization = `Bearer ${token}`;
      mockRequest.url = '/validate-token';

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });
  });

  describe('parseJwt', () => {
    it('should parse JWT correctly', () => {
      const payload = { userType: 'worker' };
      const token = generateMockJwt(payload);

      const result = parseJwt(token);

      expect(result).toEqual(payload);
    });

    it('should throw UnauthorizedException for invalid JWT', () => {
      expect(() => parseJwt('invalid.token')).toThrow(UnauthorizedException);
    });
  });
});

// Helper function to create a mock JWT token
function generateMockJwt(payload: any): string {
  const header = { alg: 'none', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header))
    .toString('base64')
    .replace(/=/g, '');
  const encodedPayload = Buffer.from(JSON.stringify(payload))
    .toString('base64')
    .replace(/=/g, '');
  return `${encodedHeader}.${encodedPayload}.signature`;
}
