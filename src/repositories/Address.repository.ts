import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address as AddressSchema } from 'src/schemas/Address.schema';
import { Address } from 'src/models/Address.model';
import { removeMongooseFields } from 'src/utils/mongoose.utils';

export interface IAddressRepository {
  create(address: Partial<Address>): Promise<Address>;
  findOne(query: Partial<Address>): Promise<Address>;
  update(id: string, payload: Partial<Address>): Promise<Address>;
}

@Injectable()
export class AddressRepository implements IAddressRepository {
  constructor(
    @InjectModel(AddressSchema.name)
    private readonly addressModel: Model<Address>,
  ) {}

  async create(address: Partial<Address>): Promise<Address> {
    const newAddress = new this.addressModel(address);
    return newAddress.save();
  }

  async findOne(query: Partial<Address>): Promise<Address> {
    return this.addressModel.findOne(query).exec();
  }

  async update(id: string, payload: Partial<Address>): Promise<Address> {
    // Remove campos imutáveis do MongoDB
    const safePayload = removeMongooseFields(payload);

    return this.addressModel
      .findByIdAndUpdate(id, safePayload, { new: true })
      .exec();
  }
}
