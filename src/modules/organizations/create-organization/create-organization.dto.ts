import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import { PlanType } from 'src/infrastructure/database/schema/plan.entity';

export class CreateOrganizationDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  acronym: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  email_domain: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  contact_name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  contact_email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  created_by: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  plan?: PlanType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  planId?: string;
}
