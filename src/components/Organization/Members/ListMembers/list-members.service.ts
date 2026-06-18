import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/repositories';
import { OrgRole, UserRole, UserStatus } from 'src/types';

export interface MemberListItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  org_role: OrgRole;
  status: UserStatus;
  created_at: Date;
}

@Injectable()
export class ListMembersService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(organizationId: string): Promise<MemberListItem[]> {
    const users = await this.userRepository.findByOrganization(organizationId);

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      org_role: user.org_role,
      status: user.status,
      created_at: user.created_at,
    }));
  }
}
