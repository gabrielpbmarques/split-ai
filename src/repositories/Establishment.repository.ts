import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Establishment } from 'src/models/Establishment.model';
import {
  Establishment as EstablishmentSchema,
  EstablishmentDocument,
} from 'src/schemas/Establishment.schema';

export interface IEstablishmentRepository {
  findById(id: string): Promise<Establishment | null>;
}

@Injectable()
export class EstablishmentRepository implements IEstablishmentRepository {
  constructor(
    @InjectModel(EstablishmentSchema.name)
    private readonly establishmentModel: Model<EstablishmentDocument>,
  ) {}

  async findById(id: string): Promise<Establishment | null> {
    const establishment = await this.establishmentModel.findById(id).exec();
    return establishment as unknown as Establishment | null;
  }
}
