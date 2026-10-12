import type { AvailableTool } from 'src/shared/contracts';

export const AVAILABLE_TOOLS: readonly AvailableTool[] = [
  {
    id: 'vector_search',
    name: 'Busca Vetorial',
    description: 'Busca trechos relevantes na base de documentos do agente.',
  },
] as const;

export const AVAILABLE_TOOL_IDS: readonly string[] = AVAILABLE_TOOLS.map(
  (tool) => tool.id,
);
