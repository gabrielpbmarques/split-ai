import { IsNotEmpty, IsString } from 'class-validator';
import { OrganizationPlan } from 'src/types';

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

  @IsNotEmpty()
  @IsString()
  plan?: OrganizationPlan;
}
