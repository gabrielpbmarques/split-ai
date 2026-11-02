import { AntiPromptInjectionService } from 'src/modules/subagents/anti-prompt-injection/anti-prompt-injection.service';

describe('AntiPromptInjectionService', () => {
  it('deve retornar o subagente de anti-prompt-injection sem ferramentas e sem model explícito', async () => {
    const service = new AntiPromptInjectionService();
    const result = await service.execute();

    expect(result.name).toBe('anti-prompt-injection-agent');
    expect(result.tools).toEqual([]);
    expect(result.model).toBeUndefined();
  });
});
