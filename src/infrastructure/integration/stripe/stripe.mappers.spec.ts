import {
  mapStripeEvent,
  StripePayloadError,
} from 'src/infrastructure/integration/stripe/stripe.mappers';

const event = (type: string, object: unknown): unknown => ({
  type,
  data: { object },
});

describe('stripe.mappers', () => {
  it('maps payment_intent.succeeded with expanded charge receipt', () => {
    expect(
      mapStripeEvent(
        event('payment_intent.succeeded', {
          id: 'pi_1',
          metadata: { credits: '120', organizationId: 'org-1' },
          latest_charge: { receipt_url: 'https://r/1' },
        }),
      ),
    ).toEqual({
      type: 'payment.succeeded',
      paymentReference: 'pi_1',
      credits: 120,
      receiptUrl: 'https://r/1',
    });
  });

  it('maps payment_intent.succeeded with a string charge to a null receipt', () => {
    expect(
      mapStripeEvent(
        event('payment_intent.succeeded', {
          id: 'pi_2',
          metadata: {},
          latest_charge: 'ch_1',
        }),
      ),
    ).toEqual({
      type: 'payment.succeeded',
      paymentReference: 'pi_2',
      credits: 0,
      receiptUrl: null,
    });
  });

  it('maps payment_intent.payment_failed with a default reason', () => {
    expect(
      mapStripeEvent(
        event('payment_intent.payment_failed', { id: 'pi_3', metadata: null }),
      ),
    ).toEqual({
      type: 'payment.failed',
      paymentReference: 'pi_3',
      reason: 'Payment failed',
    });
  });

  it('maps checkout.session.completed', () => {
    expect(
      mapStripeEvent(
        event('checkout.session.completed', {
          id: 'cs_1',
          payment_status: 'paid',
          payment_intent: 'pi_9',
        }),
      ),
    ).toEqual({
      type: 'checkout.completed',
      sessionId: 'cs_1',
      paymentReference: 'pi_9',
      paid: true,
    });
  });

  it('maps invoice.payment_succeeded with an expanded subscription', () => {
    expect(
      mapStripeEvent(
        event('invoice.payment_succeeded', {
          id: 'in_1',
          metadata: { credits: '50', organizationId: 'org-2' },
          subscription: { id: 'sub_1' },
        }),
      ),
    ).toEqual({
      type: 'subscription.renewed',
      invoiceId: 'in_1',
      subscriptionId: 'sub_1',
      organizationId: 'org-2',
      credits: 50,
    });
  });

  it('maps subscription lifecycle events', () => {
    expect(
      mapStripeEvent(event('customer.subscription.updated', { id: 'sub_2' })),
    ).toEqual({ type: 'subscription.updated', subscriptionId: 'sub_2' });

    expect(
      mapStripeEvent(
        event('customer.subscription.deleted', {
          id: 'sub_3',
          metadata: { organizationId: 'org-3' },
        }),
      ),
    ).toEqual({
      type: 'subscription.cancelled',
      subscriptionId: 'sub_3',
      organizationId: 'org-3',
    });
  });

  it('ignores unknown event types', () => {
    expect(mapStripeEvent(event('charge.refunded', { id: 'ch_1' }))).toEqual({
      type: 'ignored',
      eventType: 'charge.refunded',
    });
  });

  it('rejects a payload whose object does not match the contract', () => {
    expect(() =>
      mapStripeEvent(event('payment_intent.succeeded', { metadata: {} })),
    ).toThrow(StripePayloadError);
  });

  it('rejects an envelope without type or data', () => {
    expect(() => mapStripeEvent({ id: 'evt_1' })).toThrow(StripePayloadError);
  });
});
