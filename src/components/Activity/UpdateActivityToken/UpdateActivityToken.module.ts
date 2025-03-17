import { Module } from '@nestjs/common';
import { UpdateActivityTokenService } from './UpdateActivityToken.service';
import { ActivityRepository } from 'src/repositories/Activity.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Activity, ActivitySchema } from 'src/schemas/Activity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
    ]),
  ],
  providers: [UpdateActivityTokenService, ActivityRepository],
  exports: [UpdateActivityTokenService],
})
export class UpdateActivityTokenModule {}
