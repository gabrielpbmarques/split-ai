import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/models/User.model';
import { User as UserSchema, UserDocument } from 'src/schemas/User.schema';
import { removeMongooseFields } from 'src/utils/mongoose.utils';

export interface IUserRepository {
  findOne(query: Partial<User>): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByCPF(cpf: string): Promise<User | null>;
  update(id: string, payload: Partial<User>): Promise<User | null>;
  create(user: Partial<User>): Promise<User>;
}

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectModel(UserSchema.name)
    private userModel: Model<UserDocument>,
  ) {}

  async findOne(query: Partial<User>): Promise<User | null> {
    const user = await this.userModel.findOne(query).exec();
    return user as unknown as User | null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    return user as unknown as User | null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return user as unknown as User | null;
  }

  async findByCPF(cpf: string): Promise<User | null> {
    const user = await this.userModel.findOne({ cpf }).exec();
    return user as unknown as User | null;
  }

  async update(id: string, payload: Partial<User>): Promise<User | null> {
    const safePayload = removeMongooseFields(payload);

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, safePayload, { new: true })
      .exec();
    return updatedUser as unknown as User | null;
  }

  async updateByWorkerId(
    workerId: string,
    payload: Partial<User>,
  ): Promise<User | null> {
    const existingUser = await this.userModel.findOne({ workerId }).exec();

    if (!existingUser) {
      return null;
    }

    const safePayload = { ...payload };

    if ('_id' in safePayload) {
      delete safePayload['_id'];
    }

    const updatedUser = await this.userModel
      .findOneAndUpdate({ workerId }, safePayload, { new: true })
      .exec();

    return updatedUser as unknown as User | null;
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = new this.userModel(user);
    const savedUser = await newUser.save();
    return savedUser as unknown as User;
  }
}
