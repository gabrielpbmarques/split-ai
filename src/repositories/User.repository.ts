import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/models/User.model';
import { User as UserSchema, UserDocument } from 'src/schemas/User.schema';
import { flatten } from 'src/utils/mongoose.utils';

export interface IUserRepository {
  findOne(query: Partial<User>): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByCPF(cpf: string): Promise<User | null>;
  findByWorkerId(workerId: string): Promise<User | null>;
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
    return user ? (user.toObject() as unknown as User) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? (user.toObject() as unknown as User) : null;
  }

  async findByWorkerId(workerId: string): Promise<User | null> {
    const user = await this.userModel.findOne({ workerId }).exec();
    return user ? (user.toObject() as unknown as User) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return user ? (user.toObject() as unknown as User) : null;
  }

  async findByCPF(cpf: string): Promise<User | null> {
    const user = await this.userModel.findOne({ cpf }).exec();
    return user ? (user.toObject() as unknown as User) : null;
  }

  async update(id: string, payload: Partial<User>): Promise<User | null> {
    // Remove campos imutáveis do MongoDB no nível raiz apenas
    const { _id, __v, createdAt, updatedAt, ...safePayload } = payload as any;

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { $set: flatten(safePayload) }, { new: true })
      .exec();
    return updatedUser ? (updatedUser.toObject() as unknown as User) : null;
  }

  async updateByWorkerId(
    workerId: string,
    payload: Partial<User>,
  ): Promise<User | null> {
    const existingUser = await this.userModel.findOne({ workerId }).exec();

    if (!existingUser) {
      return null;
    }

    // Remove campos imutáveis do MongoDB no nível raiz apenas
    const { _id, __v, createdAt, updatedAt, ...safePayload } = payload as any;

    const updatedUser = await this.userModel
      .findOneAndUpdate({ workerId }, { $set: safePayload }, { new: true })
      .exec();

    return updatedUser ? (updatedUser.toObject() as unknown as User) : null;
  }

  async create(user: Partial<User>): Promise<User | null> {
    const newUser = new this.userModel(user);
    const savedUser = await newUser.save();
    return savedUser ? (savedUser.toObject() as unknown as User) : null;
  }
}
