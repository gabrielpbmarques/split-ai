import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ObjectId } from 'mongoose';
import { Token } from 'src/models/Token.model';
import { Token as TokenSchema, TokenDocument } from 'src/schemas/Token.schema';
import type { TokenType } from 'src/types/TokenType';

export interface ITokenRepository {
  create(
    payload: Omit<Token, '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Pick<Token, 'token' | 'expiresAt'>>;
  findOne(query: FilterQuery<TokenDocument>): Promise<Token | null>;
  findById(id: string): Promise<Token | null>;
  findByToken(token: string): Promise<Token | null>;
  findByWorkerAndActivity(
    workerId: string,
    activityId: string,
    type: TokenType,
  ): Promise<Token | null>;
  updateOne(id: ObjectId, payload: Partial<Token>): Promise<Token>;
}

@Injectable()
export class TokenRepository implements ITokenRepository {
  constructor(
    @InjectModel(TokenSchema.name) private tokenModel: Model<TokenDocument>,
  ) {}

  async create(
    payload: Omit<Token, '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Pick<Token, 'token' | 'expiresAt'>> {
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

  async findByWorkerAndActivity(
    workerId: string,
    activityId: string,
    type: TokenType,
  ): Promise<Token | null> {
    const result = await this.tokenModel
      .findOne(
        {
          workerId: workerId as unknown as ObjectId,
          activityId: activityId as unknown as ObjectId,
          type,
        },
        {
          expiresAt: 1,
          token: 1,
        },
      )
      .exec();
    return result as unknown as Token | null;
  }

  async findOne(query: FilterQuery<TokenDocument>): Promise<Token | null> {
    const result = await this.tokenModel.findOne(query).exec();
    return result as unknown as Token | null;
  }

  async updateOne(id: ObjectId, payload: Partial<Token>): Promise<Token> {
    const result = await this.tokenModel
      .findByIdAndUpdate(id, payload, { new: true })
      .exec();
    return result as unknown as Token | null;
  }
}
