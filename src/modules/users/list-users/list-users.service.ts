import { Injectable } from '@nestjs/common';

import { UserEntity } from 'src/infrastructure/database/schema';
import { ListUsersDto } from 'src/modules/users/list-users/list-users.dto';
import { UserRepository } from 'src/modules/users/repositories/user.repository';
import {
  PaginatedResponse,
  toPaginatedResponse,
} from 'src/shared/contracts/pagination';

const USER_FIELDS = [
  'id',
  'name',
  'email',
  'phone',
  'role',
  'org_role',
  'organization_id',
  'origin',
  'status',
  'created_at',
  'updated_at',
] as const satisfies readonly (keyof UserEntity)[];

export type UserListItem = Pick<UserEntity, (typeof USER_FIELDS)[number]>;

@Injectable()
export class ListUsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(dto: ListUsersDto): Promise<PaginatedResponse<UserListItem>> {
    const page = await this.userRepository.listPaginated(dto, USER_FIELDS);
    return toPaginatedResponse(page, dto);
  }
}
