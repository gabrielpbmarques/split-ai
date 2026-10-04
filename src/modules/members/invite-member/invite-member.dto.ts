import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import type { OrgRole } from 'src/shared/contracts';

export class InviteMemberDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsIn(['admin', 'member'])
  org_role?: Extract<OrgRole, 'admin' | 'member'>;
}
