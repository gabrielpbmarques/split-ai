import { spiderDocumentSchema } from 'src/infrastructure/integration/spider/spider.contracts';
import { mapSpiderDocument } from 'src/infrastructure/integration/spider/spider.mappers';

describe('spider.mappers', () => {
  it('maps a crawled document keeping url and title when strings', () => {
    expect(
      mapSpiderDocument({
        pageContent: 'texto',
        metadata: { url: 'https://a.com', title: 'A', depth: 1 },
      }),
    ).toEqual({
      content: 'texto',
      url: 'https://a.com',
      title: 'A',
      metadata: { url: 'https://a.com', title: 'A', depth: 1 },
    });
  });

  it('drops non-string url and title', () => {
    expect(
      mapSpiderDocument({ pageContent: 'x', metadata: { url: 1, title: '' } }),
    ).toMatchObject({ url: undefined, title: undefined });
  });

  it('defaults missing metadata to an empty object', () => {
    expect(spiderDocumentSchema.parse({ pageContent: 'x' }).metadata).toEqual(
      {},
    );
    expect(spiderDocumentSchema.safeParse({ metadata: {} }).success).toBe(
      false,
    );
  });
});
