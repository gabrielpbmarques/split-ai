import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationRepository } from 'src/repositories';
import { Organization } from 'src/types';

@Injectable()
export class GetEmbedSettingsService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(id: string): Promise<Partial<Organization>> {
    const org = await this.organizationRepository.findById(id);
    if (!org) throw new NotFoundException('Organização não encontrada');

    return {
      id: org.id,
      chat_embed_enabled: org.chat_embed_enabled,
      chat_embed_token: org.chat_embed_token,
      chat_embed_agent_id: org.chat_embed_agent_id,
      chat_embed_primary_color: org.chat_embed_primary_color,
      chat_embed_button_position: org.chat_embed_button_position,
      chat_embed_greeting: org.chat_embed_greeting,
      chat_embed_welcome_enabled: org.chat_embed_welcome_enabled,
    };
  }
}
