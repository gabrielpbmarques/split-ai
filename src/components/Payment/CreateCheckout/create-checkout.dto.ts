import { IsEnum, IsOptional, IsUrl, IsUUID } from 'class-validator';
import { PlanType } from 'src/entities/plan.entity';

export class CreateCheckoutDto {
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsEnum(PlanType)
  planType: PlanType;

  @IsOptional()
  @IsUrl({ require_tld: false })
  successUrl?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  cancelUrl?: string;
}
