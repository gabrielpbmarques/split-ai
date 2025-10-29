import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationRepository } from 'src/repositories';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RegenerateEmbedTokenService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(id: string) {
    const org = await this.organizationRepository.findById(id);
    if (!org) throw new NotFoundException('Organização não encontrada');

    const newToken = uuidv4();
    const updated = await this.organizationRepository.update(id, {
      chat_embed_token: newToken,
    });

    return {
      id: updated?.id,
      chat_embed_token: updated?.chat_embed_token,
    };
  }
}
