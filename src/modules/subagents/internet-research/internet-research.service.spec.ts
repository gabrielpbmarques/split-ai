import { InternetResearchService } from 'src/modules/subagents/internet-research/internet-research.service';
import type { ToolLoaderService } from 'src/modules/tools/tool-loader/tool-loader.service';

describe('InternetResearchService', () => {
  it('deve retornar o subagente de pesquisa na internet com as ferramentas carregadas e sem model explícito', async () => {
    const mockTool = { name: 'tavily_search' } as any;
    const toolLoaderService = {
      execute: jest.fn().mockResolvedValue([mockTool]),
    } as unknown as ToolLoaderService;

    const service = new InternetResearchService(toolLoaderService);
    const result = await service.execute();

    expect(result.name).toBe('internet-research-agent');
    expect(result.tools).toEqual([mockTool]);
    expect(result.model).toBeUndefined();
    expect(toolLoaderService.execute).toHaveBeenCalledWith('internet_research');
  });
});
