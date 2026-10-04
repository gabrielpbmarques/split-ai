import { randomUUID } from 'crypto';

import { UserEntity } from 'src/infrastructure/database/schema';
import {
  bearer,
  createOrganization,
  createPlan,
  createUser,
  PASSWORD,
} from 'test/support/factories';
import { createTestApp, type TestApp } from 'test/support/test-app';

describe('members (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  beforeEach(() => t.reset());
  afterAll(() => t.close());

  async function ownerAndOrganization() {
    const organization = await createOrganization(t.dataSource);
    const owner = await createUser(t.dataSource, {
      organization_id: organization.id,
      org_role: 'owner',
    });
    return { organization, owner };
  }

  it('invites a member, accepts the invite and lets the new member log in', async () => {
    const { organization, owner } = await ownerAndOrganization();

    const invite = await t
      .http()
      .post('/organization/members/invite')
      .set('Authorization', bearer(owner))
      .send({
        email: 'convidado@example.test',
        name: 'Convidado',
        org_role: 'admin',
      })
      .expect(201);

    expect(invite.body).toMatchObject({ email: 'convidado@example.test' });
    expect(typeof invite.body.invite_token).toBe('string');

    await t
      .http()
      .post('/organization/members/accept')
      .send({
        email: 'convidado@example.test',
        token: 'errado',
        password: PASSWORD,
      })
      .expect(400);

    await t
      .http()
      .post('/organization/members/accept')
      .send({
        email: 'convidado@example.test',
        token: invite.body.invite_token,
        password: PASSWORD,
      })
      .expect(200);

    const member = await t.dataSource
      .getRepository(UserEntity)
      .findOneByOrFail({ email: 'convidado@example.test' });
    expect(member).toMatchObject({
      status: 'active',
      org_role: 'admin',
      organization_id: organization.id,
      invite_token_hash: null,
    });

    await t
      .http()
      .post('/auth/login')
      .send({ email: 'convidado@example.test', password: PASSWORD })
      .expect(200);
  });

  it('rejects a duplicated e-mail (409), an owner role (400) and a member without member.manage (403)', async () => {
    const { organization, owner } = await ownerAndOrganization();
    const existing = await createUser(t.dataSource, {
      organization_id: organization.id,
    });

    await t
      .http()
      .post('/organization/members/invite')
      .set('Authorization', bearer(owner))
      .send({ email: existing.email })
      .expect(409);
    await t
      .http()
      .post('/organization/members/invite')
      .set('Authorization', bearer(owner))
      .send({ email: 'x@example.test', org_role: 'owner' })
      .expect(400);
    await t
      .http()
      .post('/organization/members/invite')
      .set('Authorization', bearer(existing))
      .send({ email: 'y@example.test' })
      .expect(403);
    await t
      .http()
      .post('/organization/members/invite')
      .send({ email: 'z@example.test' })
      .expect(401);
  });

  it('enforces the plan max_users quota with 403', async () => {
    const plan = await createPlan(t.dataSource, { max_users: 1 });
    const organization = await createOrganization(t.dataSource, { plan });
    const owner = await createUser(t.dataSource, {
      organization_id: organization.id,
      org_role: 'owner',
    });

    await t
      .http()
      .post('/organization/members/invite')
      .set('Authorization', bearer(owner))
      .send({ email: 'alem@example.test' })
      .expect(403);
  });

  it('lists members with pagination, changes a role and removes a member', async () => {
    const { organization, owner } = await ownerAndOrganization();
    const member = await createUser(t.dataSource, {
      organization_id: organization.id,
    });
    await createUser(t.dataSource);

    const list = await t
      .http()
      .post('/organization/members/list')
      .set('Authorization', bearer(owner))
      .send({ page: 1, limit: 10 })
      .expect(200);
    expect(list.body.total).toBe(2);
    expect(list.body.items.map((m: { id: string }) => m.id).sort()).toEqual(
      [owner.id, member.id].sort(),
    );

    await t
      .http()
      .post('/organization/members/role')
      .set('Authorization', bearer(owner))
      .send({ user_id: member.id, org_role: 'admin' })
      .expect(200)
      .expect({ id: member.id, org_role: 'admin' });

    await t
      .http()
      .post('/organization/members/role')
      .set('Authorization', bearer(owner))
      .send({ user_id: owner.id, org_role: 'member' })
      .expect(400);
    await t
      .http()
      .post('/organization/members/role')
      .set('Authorization', bearer(owner))
      .send({ user_id: randomUUID(), org_role: 'member' })
      .expect(404);

    await t
      .http()
      .post('/organization/members/remove')
      .set('Authorization', bearer(owner))
      .send({ user_id: owner.id })
      .expect(400);
    await t
      .http()
      .post('/organization/members/remove')
      .set('Authorization', bearer(owner))
      .send({ user_id: member.id })
      .expect(204);

    const after = await t
      .http()
      .post('/organization/members/list')
      .set('Authorization', bearer(owner))
      .send({})
      .expect(200);
    expect(after.body.total).toBe(1);
  });
});
