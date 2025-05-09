import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Job } from 'src/models/Job.model';
import { Job as JobSchema, JobDocument } from 'src/schemas/Job.schema';
import { flatten } from 'src/utils/mongoose.utils';

export interface IJobRepository {
  aggregate(pipeline: PipelineStage[]): Promise<Job[]>;
  findOne(query: Partial<Job>): Promise<Job>;
  findById(id: string): Promise<Job | null>;
  findByUserId(userId: string): Promise<Job[]>;
  findByCompanyId(companyId: string): Promise<Job[]>;
  update(id: string, payload: Partial<Job>): Promise<Job | null>;
  create(job: Partial<Job>): Promise<Job>;
  findTemplates(query: Partial<Job>): Promise<Job[]>;
}

@Injectable()
export class JobRepository implements IJobRepository {
  constructor(
    @InjectModel(JobSchema.name)
    private jobModel: Model<JobDocument>,
  ) {}

  async aggregate(pipeline: PipelineStage[]): Promise<Job[]> {
    const jobs = await this.jobModel.aggregate(pipeline).exec();
    return jobs.map((job) => job as unknown as Job);
  }

  async findOne(query: Partial<Job>): Promise<Job> {
    const job = await this.jobModel.findOne(query).exec();
    return job ? (job.toObject() as unknown as Job) : null;
  }

  async findById(id: string): Promise<Job | null> {
    const job = await this.jobModel.findById(id).exec();
    return job ? (job.toObject() as unknown as Job) : null;
  }

  async findByUserId(userId: string): Promise<Job[]> {
    const jobs = await this.jobModel.find({ userId }).exec();
    return jobs.map((job) => job.toObject() as unknown as Job);
  }

  async findByCompanyId(companyId: string): Promise<Job[]> {
    const jobs = await this.jobModel.find({ companyId }).exec();
    return jobs.map((job) => job.toObject() as unknown as Job);
  }

  /**
   * Atualiza um job usando o operador $set do MongoDB
   * @param id ID do job a ser atualizado
   * @param payload Dados para atualização
   * @returns Job atualizado
   */
  async update(id: string, payload: Partial<Job> | any): Promise<Job | null> {
    const { _id, __v, createdAt, updatedAt, ...safePayload } = payload as any;

    const flatPayload = flatten(safePayload);

    const updatedJob = await this.jobModel
      .findByIdAndUpdate(id, { $set: flatPayload }, { new: true })
      .exec();

    return updatedJob ? (updatedJob.toObject() as unknown as Job) : null;
  }

  async create(job: Partial<Job>): Promise<Job> {
    const newJob = new this.jobModel(job);
    const savedJob = await newJob.save();
    return savedJob.toObject() as unknown as Job;
  }

  async findTemplates(
    query: Partial<Job> = {},
    project?: { [key: string]: 0 | 1 },
  ): Promise<Job[]> {
    const templates = await this.jobModel
      .find({ ...query, isTemplate: true })
      .select(project)
      .exec();
    return templates.map((template) => template.toObject() as unknown as Job);
  }
}
