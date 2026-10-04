import { IsIn, IsNotEmpty, IsUUID } from 'class-validator';

import type { OrgRole } from 'src/shared/contracts';

export class UpdateMemberRoleDto {
  @IsNotEmpty()
  @IsUUID()
  user_id!: string;

  @IsNotEmpty()
  @IsIn(['admin', 'member'])
  org_role!: Extract<OrgRole, 'admin' | 'member'>;
}
