import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class UpdateEmbedSettingsDto {
  @IsOptional()
  @IsBoolean()
  chat_embed_enabled?: boolean;

  @IsOptional()
  @IsUUID()
  chat_embed_agent_id?: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^#([0-9a-fA-F]{3}){1,2}$/)
  chat_embed_primary_color?: string | null;

  @IsOptional()
  @IsEnum(['bottom-right', 'bottom-left', 'top-right', 'top-left'] as const)
  chat_embed_button_position?:
    | 'bottom-right'
    | 'bottom-left'
    | 'top-right'
    | 'top-left';

  @IsOptional()
  @IsString()
  chat_embed_greeting?: string | null;

  @IsOptional()
  @IsBoolean()
  chat_embed_welcome_enabled?: boolean;
}
