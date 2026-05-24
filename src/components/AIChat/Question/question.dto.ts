import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

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
   * Tenant scope for API-key callers. Required when authenticating via
   * `Authorization: ApiKey ...` (no JWT user). For JWT callers it is ignored
   * — the organization is derived from the token's `organization_id`.
   */
  @IsUUID()
  @IsOptional()
  organizationId?: string;

  /**
   * Optional companyId (legacy numeric tenant id) — passed through to
   * downstream tools that still resolve scope by company. Mostly used by
   * the analytics agents when called server-to-server.
   */
  @IsInt()
  @IsPositive()
  @IsOptional()
  companyId?: number;

  /**
   * Optional conversation identifier. When provided, used to derive the
   * agent's `threadId` so memory persists across calls in the same
   * conversation. Required for API-key analytics-style callers; for JWT
   * callers the session id is used as a fallback.
   */
  @IsString()
  @IsOptional()
  conversationId?: string;
}
