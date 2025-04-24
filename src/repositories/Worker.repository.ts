import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Worker } from 'src/models/Worker.model';
import {
  Worker as WorkerSchema,
  WorkerDocument,
} from 'src/schemas/Worker.schema';
import { removeMongooseFields } from 'src/utils/mongoose.utils';

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
    return worker as unknown as Worker;
  }

  async findById(id: string): Promise<Worker | null> {
    const worker = await this.workerModel.findById(id).exec();
    return worker as unknown as Worker | null;
  }

  async findByUserId(userId: string): Promise<Worker | null> {
    const worker = await this.workerModel.findOne({ userId }).exec();
    return worker as unknown as Worker | null;
  }

  async findByCPF(cpf: string): Promise<Worker | null> {
    const worker = await this.workerModel.findOne({ cpf }).exec();
    return worker as unknown as Worker | null;
  }

  /**
   * Atualiza um worker removendo campos imutáveis do MongoDB
   * @param id ID do worker a ser atualizado
   * @param payload Dados para atualização
   * @returns Worker atualizado
   */
  async update(id: string, payload: Partial<Worker>): Promise<Worker | null> {
    // Remove campos imutáveis do MongoDB
    const safePayload = removeMongooseFields(payload);

    const updatedWorker = await this.workerModel
      .findByIdAndUpdate(id, safePayload, { new: true })
      .exec();
    return updatedWorker as unknown as Worker | null;
  }

  async create(worker: Partial<Worker>): Promise<Worker> {
    const newWorker = new this.workerModel(worker);
    const savedWorker = await newWorker.save();
    return savedWorker as unknown as Worker;
  }

  /**
   * Busca um worker com todas as suas relações (telefone, endereço e conta bancária)
   * @param query Filtro para buscar o worker
   * @returns Worker com dados normalizados conforme messageDataParser
   */
  async findOneWithRelations(query: Partial<Worker>): Promise<any> {
    const pipeline = [
      { $match: query },
      // Lookup para buscar o telefone
      {
        $lookup: {
          from: 'phones',
          localField: 'phoneId',
          foreignField: '_id',
          as: 'phoneData',
        },
      },
      { $unwind: { path: '$phoneData', preserveNullAndEmptyArrays: true } },
      // Lookup para buscar o endereço
      {
        $lookup: {
          from: 'addresses',
          localField: 'addressId',
          foreignField: '_id',
          as: 'addressData',
        },
      },
      { $unwind: { path: '$addressData', preserveNullAndEmptyArrays: true } },
      // Lookup para buscar a conta bancária
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
