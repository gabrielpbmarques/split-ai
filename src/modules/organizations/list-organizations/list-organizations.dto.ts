import { IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationDto } from 'src/shared/http/pagination.dto';

export class ListOrganizationsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  acronym?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  email_domain?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  contact_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  contact_email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  plan?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  activated_at?: string;
}
