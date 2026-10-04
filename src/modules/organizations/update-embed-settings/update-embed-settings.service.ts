import { Injectable, NotFoundException } from '@nestjs/common';

import type { OrganizationEntity } from 'src/infrastructure/database/schema';
import { OrganizationRepository } from 'src/modules/organizations/repositories/organization.repository';
import type { UpdateEmbedSettingsDto } from 'src/modules/organizations/update-embed-settings/update-embed-settings.dto';

export type EmbedSettings = Pick<
  OrganizationEntity,
  | 'id'
  | 'chat_embed_enabled'
  | 'chat_embed_token'
  | 'chat_embed_agent_id'
  | 'chat_embed_primary_color'
  | 'chat_embed_button_position'
  | 'chat_embed_greeting'
  | 'chat_embed_welcome_enabled'
>;

@Injectable()
export class UpdateEmbedSettingsService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateEmbedSettingsDto,
  ): Promise<EmbedSettings> {
    const org = await this.organizationRepository.findById(id);
    if (!org) throw new NotFoundException('Organização não encontrada');

    const updated = await this.organizationRepository.updateEmbedSettings(id, {
      ...dto,
    });
    if (!updated) throw new NotFoundException('Organização não encontrada');

    return {
      id: updated.id,
      chat_embed_enabled: updated.chat_embed_enabled,
      chat_embed_token: updated.chat_embed_token,
      chat_embed_agent_id: updated.chat_embed_agent_id,
      chat_embed_primary_color: updated.chat_embed_primary_color,
      chat_embed_button_position: updated.chat_embed_button_position,
      chat_embed_greeting: updated.chat_embed_greeting,
      chat_embed_welcome_enabled: updated.chat_embed_welcome_enabled,
    };
  }
}
