import { IsEmail, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { UserRole, UserStatus } from 'src/types';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
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
