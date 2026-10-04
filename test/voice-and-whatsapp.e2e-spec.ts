import { rm } from 'fs/promises';

import { UserEntity } from 'src/infrastructure/database/schema';
import { bearer, createUser } from 'test/support/factories';
import { createTestApp, type TestApp } from 'test/support/test-app';

describe('voice + whatsapp (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  beforeEach(() => t.reset());
  afterAll(() => t.close());

  it('POST /artificial-intelligence/convert-text-to-speech synthesizes through the mocked ports', async () => {
    const staff = await createUser(t.dataSource);

    const { body } = await t
      .http()
      .post('/artificial-intelligence/convert-text-to-speech')
      .set('Authorization', bearer(staff))
      .send({ text: 'Olá, mundo' })
      .expect(201);

    expect(body.fileName).toMatch(/\.mp3$/);
    expect(body.publicUrl).toContain('storage.mock.local');
    await rm(body.audioPath, { force: true });

    await t
      .http()
      .post('/artificial-intelligence/convert-text-to-speech')
      .set('Authorization', bearer(staff))
      .send({ text: '' })
      .expect(400);

    const guest = await createUser(t.dataSource, { role: 'guest' });
    await t
      .http()
      .post('/artificial-intelligence/convert-text-to-speech')
      .set('Authorization', bearer(guest))
      .send({ text: 'x' })
      .expect(403);
    await t
      .http()
      .post('/artificial-intelligence/convert-text-to-speech')
      .send({ text: 'x' })
      .expect(401);
  });

  it('POST /whatsapp/webhook registers the sender and always answers empty TwiML', async () => {
    const res = await t
      .http()
      .post('/whatsapp/webhook')
      .type('form')
      .send({
        WaId: '5511988887777',
        ProfileName: 'Zap',
        Body: 'oi',
        MessageSid: 'SM1',
      })
      .expect(200);

    expect(res.headers['content-type']).toContain('text/xml');
    expect(res.text).toBe('<Response/>');

    const user = await t.dataSource
      .getRepository(UserEntity)
      .findOneByOrFail({ phone: '5511988887777' });
    expect(user).toMatchObject({ name: 'Zap', origin: 'whatsapp' });

    await t
      .http()
      .post('/whatsapp/webhook')
      .type('form')
      .send({ Body: 'sem remetente' })
      .expect(200);
  });
});
