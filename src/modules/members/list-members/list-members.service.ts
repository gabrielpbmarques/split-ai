import { Injectable } from '@nestjs/common';

import type { UserEntity } from 'src/infrastructure/database/schema';
import type { ListMembersDto } from 'src/modules/members/list-members/list-members.dto';
import { UserRepository } from 'src/modules/users/repositories/user.repository';
import {
  type PaginatedResponse,
  toPaginatedResponse,
} from 'src/shared/contracts/pagination';

const MEMBER_FIELDS = [
  'id',
  'name',
  'email',
  'role',
  'org_role',
  'status',
  'created_at',
] as const satisfies readonly (keyof UserEntity)[];

export type MemberListItem = Pick<UserEntity, (typeof MEMBER_FIELDS)[number]>;

@Injectable()
export class ListMembersService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    organizationId: string,
    dto: ListMembersDto,
  ): Promise<PaginatedResponse<MemberListItem>> {
    const page = await this.userRepository.listByOrganizationPaginated(
      organizationId,
      dto,
      MEMBER_FIELDS,
    );
    return toPaginatedResponse(page, dto);
  }
}
