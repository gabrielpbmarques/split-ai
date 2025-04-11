import { Module } from '@nestjs/common';
import { CreateUserService } from './create-user.service';
import { UserRepository } from 'src/repositories/User.repository';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/User.schema';
import { Worker, WorkerSchema } from 'src/schemas/Worker.schema';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Worker.name, schema: WorkerSchema },
    ]),
  ],
  providers: [CreateUserService, UserRepository, WorkerRepository],
  exports: [CreateUserService],
})
export class CreateUserModule {}
