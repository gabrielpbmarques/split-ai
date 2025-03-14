import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ObjectId } from 'mongoose';
import { Token } from 'src/models/Token.model';
import { Token as TokenSchema, TokenDocument } from 'src/schemas/Token.schema';

export interface ITokenRepository {
  create(payload: Omit<Token, '_id' | 'createdAt' | 'updatedAt'>): Promise<Token>;
  findOne(query: FilterQuery<TokenDocument>): Promise<Token | null>;
  findById(id: string): Promise<Token | null>;
  findByToken(token: string): Promise<Token | null>;
  findByWorkerAndActivity(workerId: ObjectId, activityId: ObjectId, type: "checkIn" | "checkOut"): Promise<Token | null>;
}

@Injectable()
export class TokenRepository implements ITokenRepository {
  constructor(
    @InjectModel(TokenSchema.name) private tokenModel: Model<TokenDocument>
  ) {}

  async create(payload: Omit<Token, '_id' | 'createdAt' | 'updatedAt'>): Promise<Token> {
    const createdToken = new this.tokenModel(payload);
    return createdToken.save() as unknown as Token;
  }

  async findById(id: string): Promise<Token | null> {
    const result = await this.tokenModel.findById(id).exec();
    return result as unknown as Token | null;
  }

  async findByToken(token: string): Promise<Token | null> {
    const result = await this.tokenModel.findOne({ token }).exec();
    return result as unknown as Token | null;
  }

  async findByWorkerAndActivity(workerId: ObjectId, activityId: ObjectId, type: "checkIn" | "checkOut"): Promise<Token | null> {
    const result = await this.tokenModel.findOne({ 
      workerId, 
      activityId,
      expiresAt: { $gt: new Date() },
      type
    }).exec();
    return result as unknown as Token | null;
  }

  async findOne(query: FilterQuery<TokenDocument>): Promise<Token | null> {
    const result = await this.tokenModel.findOne(query).exec();
    return result as unknown as Token | null;
  }
}
