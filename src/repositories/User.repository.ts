import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/models/User.schema';

export interface IUserRepository {
  create(payload: User): Promise<User>;
}

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async create(payload: User): Promise<User> {
    const createdUser = new this.userModel(payload);
    await createdUser.save();
    return payload;
  }
}
