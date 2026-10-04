import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class QuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  agentId: string;

  /**
   * Optional conversation identifier. When provided, used to derive the
   * agent's `threadId` so memory persists across calls in the same
   * conversation. Falls back to the session id.
   */
  @IsString()
  @IsOptional()
  conversationId?: string;

  /**
   * Per-call prompt variables surfaced to the agent in the VRS block
   * (e.g. `{ companyId: "123" }`). Server-controlled keys
   * (`sessionId`, `conversationId`, `threadId`, `organizationId`) always
   * override anything passed here.
   */
  @IsObject()
  @IsOptional()
  variables?: Record<string, string>;
}
