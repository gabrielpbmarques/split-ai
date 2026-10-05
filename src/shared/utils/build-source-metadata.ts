import type { CustomMetadata } from 'src/shared/contracts';

export function buildSourceMetadata(params: {
  sourceType?: string;
  defaultSourceType: string;
  agentId: string;
  sourceId: string;
}): CustomMetadata {
  const { sourceType, defaultSourceType, agentId, sourceId } = params;

  return {
    source_type: sourceType || defaultSourceType,
    agent_id: agentId,
    source_id: sourceId,
  };
}
