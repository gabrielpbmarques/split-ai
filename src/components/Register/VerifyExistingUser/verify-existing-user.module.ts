import { Module } from '@nestjs/common';
import { VerifyExistingUserService } from './verify-existing-user.service';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { UserRepository } from 'src/repositories/User.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Worker, WorkerSchema } from 'src/schemas/Worker.schema';
import { User, UserSchema } from 'src/schemas/User.schema';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Worker.name, schema: WorkerSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [VerifyExistingUserService, WorkerRepository, UserRepository],
  exports: [VerifyExistingUserService],
})
export class VerifyExistingUserModule {}
