import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreateUserService } from './CreateUser.service';
import { CreateUserController } from './CreateUser.controller';
import { UserRepository } from 'src/repositories/User.repository';
import { DatabaseModule } from 'src/database/database.module';
import { User, UserSchema } from 'src/models/User.schema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  providers: [
    CreateUserService,
    UserRepository,
  ],
  controllers: [CreateUserController],
})
export class CreateUserModule {}
