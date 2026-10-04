import {
  assertAllowedUrl,
  isInternalHost,
  matchesAllowedHost,
  SsrfBlockedError,
} from 'src/infrastructure/integration/http-client/ssrf-guard';

const publicOnly = { allowedHosts: [], allowInternalNetwork: false };

describe('ssrf-guard', () => {
  describe('isInternalHost', () => {
    it.each([
      'localhost',
      'api.localhost',
      '127.0.0.1',
      '127.8.8.8',
      '10.1.2.3',
      '172.16.0.1',
      '172.31.255.255',
      '192.168.1.1',
      '169.254.169.254',
      '100.64.0.1',
      '0.0.0.0',
      '::1',
      '[::1]',
      'fd00::1',
      'fe80::1',
      '::ffff:10.0.0.1',
      'metadata.google.internal',
      'metadata',
      'db.svc.internal',
    ])('blocks %s', (host) => {
      expect(isInternalHost(host)).toBe(true);
    });

    it.each(['api.voyageai.com', '8.8.8.8', '172.32.0.1', '2600::1'])(
      'allows %s',
      (host) => {
        expect(isInternalHost(host)).toBe(false);
      },
    );
  });

  describe('matchesAllowedHost', () => {
    it('matches exact hosts case-insensitively', () => {
      expect(matchesAllowedHost('API.Stripe.com', ['api.stripe.com'])).toBe(
        true,
      );
    });

    it('matches wildcard subdomains but not the bare domain', () => {
      expect(matchesAllowedHost('a.example.com', ['*.example.com'])).toBe(true);
      expect(matchesAllowedHost('example.com', ['*.example.com'])).toBe(false);
    });
  });

  describe('assertAllowedUrl', () => {
    it('returns the parsed URL for a public https host', () => {
      const url = assertAllowedUrl(
        'https://api.voyageai.com/v1/rerank',
        publicOnly,
      );
      expect(url.hostname).toBe('api.voyageai.com');
    });

    it('rejects non-http protocols', () => {
      expect(() => assertAllowedUrl('ftp://example.com/x', publicOnly)).toThrow(
        SsrfBlockedError,
      );
      expect(() => assertAllowedUrl('file:///etc/passwd', publicOnly)).toThrow(
        SsrfBlockedError,
      );
    });

    it('rejects internal hosts unless explicitly allowed', () => {
      expect(() =>
        assertAllowedUrl('http://169.254.169.254/latest', publicOnly),
      ).toThrow(SsrfBlockedError);
      expect(() =>
        assertAllowedUrl('http://localhost:4000/health', {
          allowedHosts: [],
          allowInternalNetwork: true,
        }),
      ).not.toThrow();
    });

    it('enforces the allowlist when present', () => {
      const options = {
        allowedHosts: ['api.voyageai.com'],
        allowInternalNetwork: false,
      };

      expect(() =>
        assertAllowedUrl('https://api.voyageai.com/v1', options),
      ).not.toThrow();
      expect(() =>
        assertAllowedUrl('https://evil.example.com/v1', options),
      ).toThrow(SsrfBlockedError);
    });

    it('rejects embedded credentials and invalid URLs', () => {
      expect(() =>
        assertAllowedUrl('https://user:pw@api.voyageai.com/', publicOnly),
      ).toThrow(SsrfBlockedError);
      expect(() => assertAllowedUrl('not a url', publicOnly)).toThrow(
        SsrfBlockedError,
      );
    });
  });
});
