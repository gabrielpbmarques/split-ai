import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { UpdateMemberRoleDto } from 'src/modules/members/update-member-role/update-member-role.dto';
import { UserRepository } from 'src/modules/users/repositories/user.repository';

@Injectable()
export class UpdateMemberRoleService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    dto: UpdateMemberRoleDto,
    organizationId: string,
  ): Promise<{ id: string; org_role: string }> {
    const member = await this.userRepository.findByIdInOrganization(
      dto.user_id,
      organizationId,
    );

    if (!member) {
      throw new NotFoundException('Membro não encontrado');
    }

    if (member.org_role === 'owner') {
      throw new BadRequestException(
        'Não é possível alterar o papel do proprietário da organização',
      );
    }

    await this.userRepository.update(member.id, { org_role: dto.org_role });

    return { id: member.id, org_role: dto.org_role };
  }
}
