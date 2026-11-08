import { ResolveSystemPromptService } from 'src/modules/agent-runtime/resolve-system-prompt/resolve-system-prompt.service';

describe('ResolveSystemPromptService', () => {
  const service = new ResolveSystemPromptService();

  it('anexa a seção de variáveis ao final do prompt do agente omitindo o token authorization bruto', async () => {
    const prompt = await service.execute('sherlock', {
      sessionId: 'session-1',
      threadId: 'thread-1',
      authorization: 'Bearer secret-jwt',
      emptyField: null,
    });

    expect(prompt).toBeDefined();
    expect(prompt).toContain('# SHERLOCK AI');
    expect(prompt).toContain('## Variáveis');
    expect(prompt).toContain('sessionId: session-1');
    expect(prompt).toContain('threadId: thread-1');
    expect(prompt).not.toContain('secret-jwt');
    expect(prompt).not.toContain('emptyField');
  });

  it('retorna apenas a seção de variáveis quando o agente não possui AGENT.md em disco', async () => {
    const prompt = await service.execute(null, {
      authenticated: true,
      userId: 'user-123',
    });

    expect(prompt).toBe('## Variáveis\nauthenticated: true\nuserId: user-123');
  });

  it('retorna undefined quando não há AGENT.md nem variáveis', async () => {
    await expect(service.execute(null)).resolves.toBeUndefined();
  });
});
