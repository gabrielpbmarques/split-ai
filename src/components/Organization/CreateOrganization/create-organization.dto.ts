import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { PlanType } from 'src/entities/plan.entity';

export class CreateOrganizationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  acronym: string;

  @IsNotEmpty()
  @IsString()
  email_domain: string;

  @IsNotEmpty()
  @IsString()
  contact_name: string;

  @IsNotEmpty()
  @IsString()
  contact_email: string;

  @IsNotEmpty()
  @IsString()
  created_by: string;

  @IsOptional()
  @IsString()
  plan?: PlanType;

  @IsOptional()
  @IsString()
  planId?: string;
}
