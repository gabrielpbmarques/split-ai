import type { AntiPersonalLeakService } from 'src/modules/subagents/anti-personal-leak/anti-personal-leak.service';
import type { AntiPromptInjectionService } from 'src/modules/subagents/anti-prompt-injection/anti-prompt-injection.service';
import type { InternetResearchService } from 'src/modules/subagents/internet-research/internet-research.service';
import { LoadSubagentsService } from 'src/modules/subagents/load-subagents/load-subagents.service';

describe('LoadSubagentsService', () => {
  it('deve agregar e retornar todos os subagentes cadastrados', async () => {
    const antiPromptInjectionService = {
      execute: jest
        .fn()
        .mockResolvedValue({ name: 'anti-prompt-injection-agent' }),
    } as unknown as AntiPromptInjectionService;

    const antiPersonalLeakService = {
      execute: jest
        .fn()
        .mockResolvedValue({ name: 'anti-personal-leak-agent' }),
    } as unknown as AntiPersonalLeakService;

    const internetResearchService = {
      execute: jest.fn().mockResolvedValue({ name: 'internet-research-agent' }),
    } as unknown as InternetResearchService;

    const service = new LoadSubagentsService(
      antiPromptInjectionService,
      antiPersonalLeakService,
      internetResearchService,
    );

    const result = await service.execute();

    expect(result).toHaveLength(3);
    expect(result.map((subagent) => subagent.name)).toEqual([
      'anti-prompt-injection-agent',
      'anti-personal-leak-agent',
      'internet-research-agent',
    ]);
  });
});
