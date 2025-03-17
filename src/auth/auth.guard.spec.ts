import { AuthGuard, parseJwt } from './auth.guard';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockContext: any;
  let mockRequest: any;

  beforeEach(() => {
    guard = new AuthGuard();
    mockRequest = {
      headers: {},
      url: '',
    };
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException when no token is provided', () => {
      mockRequest.headers.authorization = undefined;

      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid token format', () => {
      mockRequest.headers.authorization = 'Bearer invalid';

      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('should allow access to token endpoint for establishment users', () => {
      const payload = { userType: 'establishment' };
      const token = generateMockJwt(payload);
      mockRequest.headers.authorization = `Bearer ${token}`;
      mockRequest.url = '/token';

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockRequest.user).toEqual(payload);
    });

    it('should allow access to token endpoint for company users', () => {
      const payload = { userType: 'company' };
      const token = generateMockJwt(payload);
      mockRequest.headers.authorization = `Bearer ${token}`;
      mockRequest.url = '/token';

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockRequest.user).toEqual(payload);
    });

    it('should throw ForbiddenException for worker user accessing token endpoint', () => {
      const payload = { userType: 'worker' };
      const token = generateMockJwt(payload);
      mockRequest.headers.authorization = `Bearer ${token}`;
      mockRequest.url = '/token';

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should allow access to validate-token endpoint for worker users', () => {
      const payload = { userType: 'worker' };
      const token = generateMockJwt(payload);
      mockRequest.headers.authorization = `Bearer ${token}`;
      mockRequest.url = '/validate-token';

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockRequest.user).toEqual(payload);
    });

    it('should throw ForbiddenException for establishment user accessing validate-token endpoint', () => {
      const payload = { userType: 'establishment' };
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
