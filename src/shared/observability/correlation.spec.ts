import { IncomingMessage } from 'node:http';

import { extractTraceId, generateRequestId } from './correlation';

const requestWith = (headers: Record<string, string>): IncomingMessage =>
  ({ headers }) as unknown as IncomingMessage;

describe('generateRequestId', () => {
  it('reuses a well-formed x-request-id header', () => {
    expect(
      generateRequestId(requestWith({ 'x-request-id': 'abc-123.v2' })),
    ).toBe('abc-123.v2');
  });

  it('generates a UUID when the header is missing or malformed', () => {
    const uuid = /^[0-9a-f-]{36}$/;

    expect(generateRequestId(requestWith({}))).toMatch(uuid);
    expect(
      generateRequestId(requestWith({ 'x-request-id': 'has spaces<script>' })),
    ).toMatch(uuid);
  });
});

describe('extractTraceId', () => {
  it('reads the trace id from a valid traceparent header', () => {
    expect(
      extractTraceId('00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01'),
    ).toBe('4bf92f3577b34da6a3ce929d0e0e4736');
  });

  it('returns undefined for a missing or malformed header', () => {
    expect(extractTraceId(undefined)).toBeUndefined();
    expect(extractTraceId('garbage')).toBeUndefined();
  });
});
