import { ServiceUnavailableException } from '@nestjs/common';

import {
  LiveTavilySearchService,
  MockTavilySearchService,
} from 'src/infrastructure/providers/tavily.provider';

describe('tavily.provider', () => {
  it('returns simulated search results in mock mode', async () => {
    const service = new MockTavilySearchService();
    const tool = service.createTool();

    expect(tool.name).toBe('tavily_search');

    const output = await tool.invoke({ query: 'nestjs' });
    expect(JSON.parse(String(output))).toMatchObject({
      query: 'nestjs',
      results: [
        {
          title: 'Resultado simulado para nestjs',
          url: 'https://example.com',
        },
      ],
    });
  });

  it('throws ServiceUnavailableException when TAVILY_API_KEY is missing in live service', () => {
    const service = new LiveTavilySearchService();

    expect(() => service.createTool()).toThrow(ServiceUnavailableException);
  });
});
