import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { OrgRole } from 'src/shared/contracts';

export class InviteMemberDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  // Owner cannot be assigned via invite; only admin/member.
  @IsOptional()
  @IsIn(['admin', 'member'])
  org_role?: Extract<OrgRole, 'admin' | 'member'>;
}
