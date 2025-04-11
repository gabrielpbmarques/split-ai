import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address as AddressSchema } from 'src/schemas/Address.schema';
import { Address } from 'src/models/Address.model';

@Injectable()
export class AddressRepository {
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
    return this.addressModel
      .findByIdAndUpdate(id, payload, { new: true })
      .exec();
  }
}
