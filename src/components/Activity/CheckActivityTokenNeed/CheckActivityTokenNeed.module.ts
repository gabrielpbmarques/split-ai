import { Module } from '@nestjs/common';
import { CheckActivityTokenNeedService } from './CheckActivityTokenNeed.service';
import { CheckActivityTokenNeedController } from './CheckActivityTokenNeed.controller';
import { DatabaseModule } from 'src/database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityRepository } from 'src/repositories/Activity.repository';
import { EstablishmentRepository } from 'src/repositories/Establishment.repository';
import { Activity, ActivitySchema } from 'src/schemas/Activity.schema';
import {
  Establishment,
  EstablishmentSchema,
} from 'src/schemas/Establishment.schema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
    ]),
    MongooseModule.forFeature([
      { name: Establishment.name, schema: EstablishmentSchema },
    ]),
  ],
  providers: [
    CheckActivityTokenNeedService,
    ActivityRepository,
    EstablishmentRepository,
  ],
  controllers: [CheckActivityTokenNeedController],
})
export class CheckActivityTokenNeedModule {}
