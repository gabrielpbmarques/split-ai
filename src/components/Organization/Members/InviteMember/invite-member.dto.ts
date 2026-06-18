import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { OrgRole } from 'src/types';

export class InviteMemberDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  // Owner cannot be assigned via invite; only admin/member.
  @IsOptional()
  @IsIn(['admin', 'member'])
  org_role?: Extract<OrgRole, 'admin' | 'member'>;
}
