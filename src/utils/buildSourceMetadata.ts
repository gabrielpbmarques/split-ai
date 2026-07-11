import { CustomMetadata } from 'src/types';

export function buildSourceMetadata(params: {
  sourceType?: string;
  defaultSourceType: string;
  agentId: string;
  organizationId: string | null;
  sourceId: string;
}): CustomMetadata {
  const { sourceType, defaultSourceType, agentId, organizationId, sourceId } =
    params;

  return {
    source_type: sourceType || defaultSourceType,
    agent_id: agentId,
    source_id: sourceId,
    ...(organizationId ? { organization_id: organizationId } : {}),
  };
}
