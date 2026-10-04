import { randomUUID } from 'crypto';

import {
  CreditBalanceEntity,
  OrganizationEntity,
  PaymentEntity,
} from 'src/infrastructure/database/schema';
import { PaymentStatus } from 'src/infrastructure/database/schema/payment.entity';
import { PlanType } from 'src/infrastructure/database/schema/plan.entity';
import {
  bearer,
  createCreditBalance,
  createOrganization,
  createPlan,
  createUser,
} from 'test/support/factories';
import { createTestApp, type TestApp } from 'test/support/test-app';

describe('billing (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  beforeEach(() => t.reset());
  afterAll(() => t.close());

  it('GET /payment/plans and /payment/stripe-public-key are public', async () => {
    await createPlan(t.dataSource, { type: PlanType.FREE });

    const plans = await t.http().get('/payment/plans').expect(200);
    expect(plans.body).toHaveLength(1);

    const key = await t.http().get('/payment/stripe-public-key').expect(200);
    expect(key.body).toHaveProperty('publicKey');
  });

  it('POST /payment/checkout opens a checkout through the payments port and records a pending payment', async () => {
    const plan = await createPlan(t.dataSource, { type: PlanType.STARTER });
    const organization = await createOrganization(t.dataSource, { plan });
    const user = await createUser(t.dataSource, {
      organization_id: organization.id,
    });

    const { body } = await t
      .http()
      .post('/payment/checkout')
      .set('Authorization', bearer(user))
      .send({
        planType: PlanType.STARTER,
        successUrl: 'https://app.test/ok',
        cancelUrl: 'https://app.test/cancel',
      })
      .expect(201);

    expect(body.url).toContain('checkout.mock.local');
    expect(typeof body.sessionId).toBe('string');

    const payment = await t.dataSource
      .getRepository(PaymentEntity)
      .findOneByOrFail({ organization_id: organization.id });
    expect(payment).toMatchObject({
      status: PaymentStatus.PENDING,
      credits_purchased: 1000,
    });

    await t
      .http()
      .post('/payment/checkout')
      .set('Authorization', bearer(user))
      .send({ planType: 'inexistente' })
      .expect(400);
    await t
      .http()
      .post('/payment/checkout')
      .send({ planType: PlanType.STARTER })
      .expect(401);
  });

  it('POST /payment/webhook settles a payment, grants credits and activates the organization', async () => {
    const plan = await createPlan(t.dataSource, { type: PlanType.STARTER });
    const organization = await createOrganization(t.dataSource, {
      plan,
      status: 'inactive',
    });
    const payment = await t.dataSource.getRepository(PaymentEntity).save({
      organization_id: organization.id,
      plan_id: plan.id,
      stripe_payment_intent_id: 'pi_test_1',
      amount: 99,
      currency: 'BRL',
      credits_purchased: 1000,
      status: PaymentStatus.PENDING,
      description: 'teste',
      metadata: {},
    });

    await t
      .http()
      .post('/payment/webhook')
      .set('stripe-signature', 'sig_mock')
      .set('Content-Type', 'application/json')
      .send(
        JSON.stringify({
          type: 'payment_intent.succeeded',
          data: {
            object: {
              id: 'pi_test_1',
              metadata: { credits: '1000', organizationId: organization.id },
              latest_charge: { receipt_url: 'https://stripe.test/r/1' },
            },
          },
        }),
      )
      .expect(200)
      .expect({ received: true });

    const settled = await t.dataSource
      .getRepository(PaymentEntity)
      .findOneByOrFail({ id: payment.id });
    expect(settled).toMatchObject({
      status: PaymentStatus.SUCCEEDED,
      receipt_url: 'https://stripe.test/r/1',
    });

    const balance = await t.dataSource
      .getRepository(CreditBalanceEntity)
      .findOneByOrFail({ organization_id: organization.id });
    expect(Number(balance.available_credits)).toBe(1000);

    const activated = await t.dataSource
      .getRepository(OrganizationEntity)
      .findOneByOrFail({ id: organization.id });
    expect(activated.status).toBe('active');
  });

  it('POST /payment/webhook answers 400 without signature or with a payload outside the contract', async () => {
    await t
      .http()
      .post('/payment/webhook')
      .set('Content-Type', 'application/json')
      .send(
        JSON.stringify({
          type: 'payment_intent.succeeded',
          data: { object: {} },
        }),
      )
      .expect(400);
    await t
      .http()
      .post('/payment/webhook')
      .set('stripe-signature', 'sig_mock')
      .set('Content-Type', 'application/json')
      .send(
        JSON.stringify({
          type: 'payment_intent.succeeded',
          data: { object: {} },
        }),
      )
      .expect(400);
    await t
      .http()
      .post('/payment/webhook')
      .set('stripe-signature', 'sig_mock')
      .set('Content-Type', 'application/json')
      .send(
        JSON.stringify({
          type: 'charge.refunded',
          data: { object: { id: 'ch_1' } },
        }),
      )
      .expect(200);
  });

  it('GET /payment/credits, /payment/transactions and /payment/history are scoped to the user organization', async () => {
    const organization = await createOrganization(t.dataSource);
    const user = await createUser(t.dataSource, {
      organization_id: organization.id,
    });
    await createCreditBalance(t.dataSource, {
      organization_id: organization.id,
      total_credits: 500,
      available_credits: 420,
      used_credits: 80,
    });

    const credits = await t
      .http()
      .get('/payment/credits')
      .set('Authorization', bearer(user))
      .expect(200);
    expect(credits.body).toMatchObject({
      total_credits: 500,
      available_credits: 420,
    });

    const transactions = await t
      .http()
      .get('/payment/transactions')
      .query({ page: 1, limit: 5 })
      .set('Authorization', bearer(user))
      .expect(200);
    expect(transactions.body).toMatchObject({ total: 0, items: [] });

    const history = await t
      .http()
      .get('/payment/history')
      .set('Authorization', bearer(user))
      .expect(200);
    expect(history.body).toMatchObject({ total: 0 });

    const orphan = await createUser(t.dataSource);
    await t
      .http()
      .get('/payment/credits')
      .set('Authorization', bearer(orphan))
      .expect(403);
    await t.http().get('/payment/credits').expect(401);
  });

  it('GET /token-usage aggregates usage for the organization', async () => {
    const organization = await createOrganization(t.dataSource);
    const user = await createUser(t.dataSource, {
      organization_id: organization.id,
    });

    const { body } = await t
      .http()
      .get('/token-usage')
      .set('Authorization', bearer(user))
      .expect(200);
    expect(body).toBeDefined();

    await t
      .http()
      .get('/token-usage')
      .query({ start_date: 'ontem' })
      .set('Authorization', bearer(user))
      .expect(400);
    await t
      .http()
      .get('/token-usage')
      .query({ organization_id: randomUUID() })
      .set('Authorization', bearer(user))
      .expect(200);
  });
});
