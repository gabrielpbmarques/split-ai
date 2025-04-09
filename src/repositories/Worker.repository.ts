import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Worker } from 'src/models/Worker.model';
import {
  Worker as WorkerSchema,
  WorkerDocument,
} from 'src/schemas/Worker.schema';

export interface IWorkerRepository {
  findOne(query: Partial<Worker>): Promise<Worker>;
  findById(id: string): Promise<Worker | null>;
  findByUserId(userId: string): Promise<Worker | null>;
  findByCPF(cpf: string): Promise<Worker | null>;
  update(id: string, payload: Partial<Worker>): Promise<Worker | null>;
  create(worker: Partial<Worker>): Promise<Worker>;
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

  async update(id: string, payload: Partial<Worker>): Promise<Worker | null> {
    const updatedWorker = await this.workerModel
      .findByIdAndUpdate(id, payload, { new: true })
      .exec();
    return updatedWorker as unknown as Worker | null;
  }

  async create(worker: Partial<Worker>): Promise<Worker> {
    const newWorker = new this.workerModel(worker);
    const savedWorker = await newWorker.save();
    return savedWorker as unknown as Worker;
  }
}
