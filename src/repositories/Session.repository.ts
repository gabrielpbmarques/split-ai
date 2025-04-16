import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session } from '../models/Session.model';
import {
  Session as SessionSchema,
  SessionDocument,
} from '../schemas/Session.schema';

export interface ISessionRepository {
  findBySessionId(sessionId: string): Promise<Session | null>;
  findByPhoneNumber(phoneNumber: string): Promise<Session | null>;
  update(sessionId: string, payload: Partial<Session>): Promise<Session | null>;
  create(session: Partial<Session>): Promise<Session>;
}

@Injectable()
export class SessionRepository implements ISessionRepository {
  constructor(
    @InjectModel(SessionSchema.name)
    private sessionModel: Model<SessionDocument>,
  ) {}

  async findBySessionId(sessionId: string): Promise<Session | null> {
    const session = await this.sessionModel.findOne({ sessionId }).exec();
    return session as unknown as Session | null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Session | null> {
    const session = await this.sessionModel
      .findOne({ phoneNumber })
      .sort({ lastInteraction: -1 })
      .exec();
    return session as unknown as Session | null;
  }

  async update(
    sessionId: string,
    payload: Partial<Session>,
  ): Promise<Session | null> {
    const updatedSession = await this.sessionModel
      .findOneAndUpdate(
        { sessionId },
        { ...payload, lastInteraction: new Date() },
        { new: true },
      )
      .exec();

    return updatedSession as unknown as Session | null;
  }

  async create(session: Partial<Session>): Promise<Session> {
    const newSession = new this.sessionModel({
      ...session,
      lastInteraction: new Date(),
      createdAt: new Date(),
    });
    const savedSession = await newSession.save();
    return savedSession as unknown as Session;
  }
}
