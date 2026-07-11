export type ProcessSourceInput = {
  buffer: Buffer;
  sourceType?: string;
  agentId: string;
  organizationId: string | null;
  sourceId: string;
};
