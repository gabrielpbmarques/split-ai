import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Worker } from 'src/models/Worker.model';
import {
  Worker as WorkerSchema,
  WorkerDocument,
} from 'src/schemas/Worker.schema';
import { flatten } from 'src/utils/mongoose.utils';

export interface IWorkerRepository {
  findOne(query: Partial<Worker>): Promise<Worker>;
  findById(id: string): Promise<Worker | null>;
  findByUserId(userId: string): Promise<Worker | null>;
  findByCPF(cpf: string): Promise<Worker | null>;
  update(id: string, payload: Partial<Worker>): Promise<Worker | null>;
  create(worker: Partial<Worker>): Promise<Worker>;
  findOneWithRelations(query: Partial<Worker>): Promise<any>;
}

@Injectable()
export class WorkerRepository implements IWorkerRepository {
  constructor(
    @InjectModel(WorkerSchema.name)
    private workerModel: Model<WorkerDocument>,
  ) {}

  async findOne(query: Partial<Worker>): Promise<Worker> {
    const worker = await this.workerModel.findOne(query).exec();
    return worker ? (worker.toObject() as unknown as Worker) : null;
  }

  async findById(id: string): Promise<Worker | null> {
    console.log('id', id);
    const worker = await this.workerModel.findById(id).exec();
    return worker ? (worker.toObject() as unknown as Worker) : null;
  }

  async findByUserId(userId: string): Promise<Worker | null> {
    const worker = await this.workerModel.findOne({ userId }).exec();
    return worker ? (worker.toObject() as unknown as Worker) : null;
  }

  async findByCPF(cpf: string): Promise<Worker | null> {
    const worker = await this.workerModel.findOne({ cpf }).exec();
    return worker ? (worker.toObject() as unknown as Worker) : null;
  }

  /**
   * Atualiza um worker usando o operador $set do MongoDB
   * @param id ID do worker a ser atualizado
   * @param payload Dados para atualização
   * @returns Worker atualizado
   */
  async update(
    id: string,
    payload: Partial<Worker> | any,
  ): Promise<Worker | null> {
    // Remove campos imutáveis do MongoDB
    const { _id, __v, createdAt, updatedAt, ...safePayload } = payload as any;

    console.log('safePayload', safePayload);

    // Aplica o achatamento apenas para garantir compatibilidade com operações existentes
    // Mas agora é mais seguro pois não há mais propriedades internas do Mongoose
    const flatPayload = flatten(safePayload);
    console.log('flatten(safePayload)', flatPayload);

    const updatedWorker = await this.workerModel
      .findByIdAndUpdate(id, { $set: flatPayload }, { new: true })
      .exec();

    return updatedWorker
      ? (updatedWorker.toObject() as unknown as Worker)
      : null;
  }

  async create(worker: Partial<Worker>): Promise<Worker> {
    const newWorker = new this.workerModel(worker);
    const savedWorker = await newWorker.save();
    return savedWorker.toObject() as unknown as Worker;
  }

  /**
   * Busca um worker com todas as suas relações (telefone, endereço e conta bancária)
   * @param query Filtro para buscar o worker
   * @returns Worker com dados normalizados conforme messageDataParser
   */
  async findOneWithRelations(query: Partial<Worker>): Promise<any> {
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'phones',
          localField: 'phoneId',
          foreignField: '_id',
          as: 'phoneData',
        },
      },
      { $unwind: { path: '$phoneData', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'addresses',
          localField: 'addressId',
          foreignField: '_id',
          as: 'addressData',
        },
      },
      { $unwind: { path: '$addressData', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'bankaccounts',
          localField: 'bankAccount',
          foreignField: '_id',
          as: 'bankAccountData',
        },
      },
      {
        $unwind: { path: '$bankAccountData', preserveNullAndEmptyArrays: true },
      },
    ];

    const result = await this.workerModel.aggregate(pipeline).exec();
    return result.length > 0 ? result[0] : null;
  }
}
