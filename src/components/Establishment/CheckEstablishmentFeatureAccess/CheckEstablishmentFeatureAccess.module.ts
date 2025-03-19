import { Module } from '@nestjs/common';
import { CheckEstablishmentFeatureAccessService } from './CheckEstablishmentFeatureAccess.service';
import { CheckEstablishmentFeatureAccessController } from './CheckEstablishmentFeatureAccess.controller';

@Module({
  providers: [CheckEstablishmentFeatureAccessService],
  controllers: [CheckEstablishmentFeatureAccessController],
})
export class CheckEstablishmentFeatureAccessModule {}
