import {
  parseInboundMessage,
  toE164,
} from 'src/infrastructure/integration/twilio/twilio.mappers';

describe('twilio.mappers', () => {
  it('maps the Twilio form into the internal inbound message', () => {
    expect(
      parseInboundMessage({
        WaId: '5511999999999',
        ProfileName: 'Ana',
        Body: 'oi',
        MessageSid: 'SM1',
        AccountSid: 'AC1',
      }),
    ).toEqual({
      senderPhone: '5511999999999',
      senderName: 'Ana',
      text: 'oi',
      messageId: 'SM1',
    });
  });

  it('returns null when the sender id is missing', () => {
    expect(parseInboundMessage({ Body: 'oi' })).toBeNull();
    expect(parseInboundMessage({ WaId: '' })).toBeNull();
  });

  it('normalizes Brazilian numbers to E.164', () => {
    expect(toE164('11999999999')).toBe('+5511999999999');
    expect(toE164('5511999999999')).toBe('+5511999999999');
    expect(toE164('+55 (11) 99999-9999')).toBe('+5511999999999');
  });
});
