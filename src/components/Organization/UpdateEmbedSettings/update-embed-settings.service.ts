import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationRepository } from 'src/repositories';

import { UpdateEmbedSettingsDto } from './update-embed-settings.dto';

@Injectable()
export class UpdateEmbedSettingsService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(id: string, dto: UpdateEmbedSettingsDto) {
    const org = await this.organizationRepository.findById(id);
    if (!org) throw new NotFoundException('Organização não encontrada');

    const updated = await this.organizationRepository.updateEmbedSettings(
      id,
      dto,
    );
    return {
      id: updated?.id,
      chat_embed_enabled: updated?.chat_embed_enabled,
      chat_embed_token: updated?.chat_embed_token,
      chat_embed_agent_id: updated?.chat_embed_agent_id,
      chat_embed_primary_color: updated?.chat_embed_primary_color,
      chat_embed_button_position: updated?.chat_embed_button_position,
      chat_embed_greeting: updated?.chat_embed_greeting,
      chat_embed_welcome_enabled: updated?.chat_embed_welcome_enabled,
    };
  }
}
