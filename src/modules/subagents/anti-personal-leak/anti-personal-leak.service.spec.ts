import { AntiPersonalLeakService } from 'src/modules/subagents/anti-personal-leak/anti-personal-leak.service';

describe('AntiPersonalLeakService', () => {
  it('deve retornar o subagente de anti-personal-leak sem ferramentas e sem model explícito', async () => {
    const service = new AntiPersonalLeakService();
    const result = await service.execute();

    expect(result.name).toBe('anti-personal-leak-agent');
    expect(result.tools).toEqual([]);
    expect(result.model).toBeUndefined();
  });
});
