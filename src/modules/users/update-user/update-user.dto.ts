import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { UserRole, UserStatus } from 'src/shared/contracts';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  phone?: string;

  @IsOptional()
  @IsIn(['user', 'admin', 'guest'])
  role?: UserRole;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: UserStatus;

  @IsOptional()
  @IsUUID()
  organization_id?: string | null;
}
