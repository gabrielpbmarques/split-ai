import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { RemoveMemberDto } from 'src/modules/members/remove-member/remove-member.dto';
import { UserRepository } from 'src/modules/users/repositories/user.repository';

@Injectable()
export class RemoveMemberService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    dto: RemoveMemberDto,
    organizationId: string,
    requesterId: string | null,
  ): Promise<{ id: string; removed: true }> {
    const member = await this.userRepository.findByIdInOrganization(
      dto.user_id,
      organizationId,
    );

    if (!member) {
      throw new NotFoundException('Membro não encontrado');
    }

    if (member.org_role === 'owner') {
      throw new BadRequestException(
        'Não é possível remover o proprietário da organização',
      );
    }

    if (member.id === requesterId) {
      throw new BadRequestException(
        'Você não pode remover a si mesmo da organização',
      );
    }

    await this.userRepository.delete(member.id);

    return { id: member.id, removed: true };
  }
}
