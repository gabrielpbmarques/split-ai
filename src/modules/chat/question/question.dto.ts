import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class QuestionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  question: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  agentId: string;

  /**
   * Optional conversation identifier. When provided, used to derive the
   * agent's `threadId` so memory persists across calls in the same
   * conversation. Falls back to the session id.
   */
  @IsOptional()
  @IsString()
  @MaxLength(255)
  conversationId?: string;

  /**
   * Per-call prompt variables surfaced to the agent in the VRS block
   * (e.g. `{ companyId: "123" }`). Server-controlled keys
   * (`sessionId`, `conversationId`, `threadId`, `organizationId`) always
   * override anything passed here.
   */
  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;
}
