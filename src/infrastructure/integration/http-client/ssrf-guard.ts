import { isIP } from 'net';

export interface SsrfGuardOptions {
  readonly allowedHosts: readonly string[];
  readonly allowInternalNetwork: boolean;
}

export class SsrfBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SsrfBlockedError';
  }
}

const METADATA_HOSTS = new Set([
  'metadata',
  'metadata.google.internal',
  'metadata.goog',
  'instance-data',
]);

const PRIVATE_IPV4_RANGES: ReadonlyArray<readonly [number, number]> = [
  [ipv4ToInt('0.0.0.0'), 8],
  [ipv4ToInt('10.0.0.0'), 8],
  [ipv4ToInt('100.64.0.0'), 10],
  [ipv4ToInt('127.0.0.0'), 8],
  [ipv4ToInt('169.254.0.0'), 16],
  [ipv4ToInt('172.16.0.0'), 12],
  [ipv4ToInt('192.168.0.0'), 16],
];

function ipv4ToInt(ip: string): number {
  return ip
    .split('.')
    .reduce((acc, octet) => ((acc << 8) | Number(octet)) >>> 0, 0);
}

function isPrivateIpv4(ip: string): boolean {
  const value = ipv4ToInt(ip);

  return PRIVATE_IPV4_RANGES.some(([network, bits]) => {
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (value & mask) === (network & mask);
  });
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase().replace(/^\[|\]$/g, '');

  if (normalized === '::' || normalized === '::1') {
    return true;
  }

  if (normalized.startsWith('::ffff:')) {
    const mapped = normalized.slice('::ffff:'.length);
    return isIP(mapped) === 4 ? isPrivateIpv4(mapped) : true;
  }

  return (
    /^f[cd][0-9a-f]{2}:/.test(normalized) ||
    /^fe[89ab][0-9a-f]:/.test(normalized)
  );
}

export function isInternalHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');

  if (host === 'localhost' || host.endsWith('.localhost')) {
    return true;
  }

  if (METADATA_HOSTS.has(host) || host.endsWith('.internal')) {
    return true;
  }

  const version = isIP(host);

  if (version === 4) {
    return isPrivateIpv4(host);
  }

  if (version === 6) {
    return isPrivateIpv6(host);
  }

  return false;
}

export function matchesAllowedHost(
  hostname: string,
  allowedHosts: readonly string[],
): boolean {
  const host = hostname.toLowerCase();

  return allowedHosts.some((entry) => {
    const allowed = entry.toLowerCase();

    if (allowed.startsWith('*.')) {
      const suffix = allowed.slice(1);
      return host.endsWith(suffix) && host.length > suffix.length;
    }

    return host === allowed;
  });
}

export function assertAllowedHost(
  hostname: string,
  options: SsrfGuardOptions,
): void {
  if (!hostname) {
    throw new SsrfBlockedError('Host vazio');
  }

  if (!options.allowInternalNetwork && isInternalHost(hostname)) {
    throw new SsrfBlockedError(`Host interno bloqueado: ${hostname}`);
  }

  if (
    options.allowedHosts.length > 0 &&
    !matchesAllowedHost(hostname, options.allowedHosts)
  ) {
    throw new SsrfBlockedError(`Host fora da allowlist: ${hostname}`);
  }
}

export function assertAllowedUrl(
  rawUrl: string,
  options: SsrfGuardOptions,
): URL {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new SsrfBlockedError(`URL inválida: ${rawUrl}`);
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new SsrfBlockedError(`Protocolo não permitido: ${url.protocol}`);
  }

  if (url.username || url.password) {
    throw new SsrfBlockedError('Credenciais na URL não são permitidas');
  }

  assertAllowedHost(url.hostname, options);

  return url;
}
