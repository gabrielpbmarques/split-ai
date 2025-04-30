import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address as AddressSchema } from 'src/schemas/Address.schema';
import { Address } from 'src/models/Address.model';
import { flatten } from 'src/utils/mongoose.utils';

export interface IAddressRepository {
  create(address: Partial<Address>): Promise<Address | null>;
  findOne(query: Partial<Address>): Promise<Address | null>;
  update(id: string, payload: Partial<Address>): Promise<Address | null>;
}

@Injectable()
export class AddressRepository implements IAddressRepository {
  constructor(
    @InjectModel(AddressSchema.name)
    private readonly addressModel: Model<Address>,
  ) {}

  async create(address: Partial<Address>): Promise<Address | null> {
    const newAddress = new this.addressModel(address);
    const createdAddress = await newAddress.save();
    return createdAddress
      ? (createdAddress.toObject() as unknown as Address)
      : null;
  }

  async findOne(query: Partial<Address>): Promise<Address | null> {
    const address = await this.addressModel.findOne(query).exec();
    return address ? (address.toObject() as unknown as Address) : null;
  }

  async update(id: string, payload: Partial<Address>): Promise<Address | null> {
    // Remove campos imutáveis do MongoDB no nível raiz apenas
    const { _id, __v, createdAt, updatedAt, ...safePayload } = payload as any;

    const updatedAddress = await this.addressModel
      .findByIdAndUpdate(id, { $set: flatten(safePayload) }, { new: true })
      .exec();

    return updatedAddress
      ? (updatedAddress.toObject() as unknown as Address)
      : null;
  }
}
