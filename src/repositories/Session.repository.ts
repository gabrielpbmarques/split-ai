import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Session as SessionSchema,
  SessionDocument,
} from 'src/schemas/Session.schema';
import { Session } from 'src/models/Session.model';
import { flatten } from 'src/utils/mongoose.utils';

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
    return session ? (session.toObject() as unknown as Session) : null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Session | null> {
    const session = await this.sessionModel
      .findOne({ phoneNumber })
      .sort({ lastInteraction: -1 })
      .exec();
    return session ? (session.toObject() as unknown as Session) : null;
  }

  async update(
    sessionId: string,
    payload: Partial<Session>,
  ): Promise<Session | null> {
    const logger = new Logger('SessionRepository.update');
    logger.log(
      `Atualizando sessão ${sessionId} com payload: ${JSON.stringify(payload)}`,
    );

    // Preserva o _id do worker explicitamente - crucial baseado nas correções anteriores
    const workerId = payload.workerData?._id;

    // Remove campos imutáveis do MongoDB
    const { _id, __v, createdAt, updatedAt, ...safePayload } = payload as any;

    // Aplica o achatamento para compatibilidade com operações existentes
    const flatPayload = flatten(safePayload);

    // Restaura o _id do worker explicitamente se existir
    if (workerId && flatPayload['workerData']) {
      flatPayload['workerData._id'] = workerId;
    }

    const updatedSession = await this.sessionModel
      .findOneAndUpdate({ sessionId }, { $set: flatPayload }, { new: true })
      .exec();

    return updatedSession
      ? (updatedSession.toObject() as unknown as Session)
      : null;
  }

  async create(session: Partial<Session>): Promise<Session> {
    const newSession = new this.sessionModel({
      ...session,
      lastInteraction: new Date(),
      createdAt: new Date(),
    });
    const savedSession = await newSession.save();
    return savedSession.toObject() as unknown as Session;
  }
}
