import { Module } from '@nestjs/common';
import { CheckEstablishmentFeatureAccessService } from './CheckEstablishmentFeatureAccess.service';
import { CheckEstablishmentFeatureAccessController } from './CheckEstablishmentFeatureAccess.controller';
import { EstablishmentRepository } from 'src/repositories/Establishment.repository';
import { DatabaseModule } from 'src/database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Establishment,
  EstablishmentSchema,
} from 'src/schemas/Establishment.schema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Establishment.name, schema: EstablishmentSchema },
    ]),
  ],
  providers: [CheckEstablishmentFeatureAccessService, EstablishmentRepository],
  controllers: [CheckEstablishmentFeatureAccessController],
})
export class CheckEstablishmentFeatureAccessModule {}
