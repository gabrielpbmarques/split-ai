import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Establishment } from 'src/models/Establishment.model';

export interface IEstablishmentRepository {
  findById(id: string): Promise<Establishment | null>;
}

@Injectable()
export class EstablishmentRepository implements IEstablishmentRepository {
  constructor(private readonly establishmentModel: Model<Establishment>) {}

  async findById(id: string): Promise<Establishment | null> {
    const establishment = await this.establishmentModel.findById(id).exec();
    return establishment as unknown as Establishment | null;
  }
}
