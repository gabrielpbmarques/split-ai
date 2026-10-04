import { IsIn, IsNotEmpty, IsUUID } from 'class-validator';

import { OrgRole } from 'src/shared/contracts';

export class UpdateMemberRoleDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  // Ownership transfer is out of scope here; only admin/member are assignable.
  @IsNotEmpty()
  @IsIn(['admin', 'member'])
  org_role: Extract<OrgRole, 'admin' | 'member'>;
}
