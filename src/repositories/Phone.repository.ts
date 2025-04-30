import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Phone } from 'src/models/Phone.model';
import { Phone as PhoneSchema } from 'src/schemas/Phone.schema';
import { flatten } from 'src/utils/mongoose.utils';

export interface IPhoneRepository {
  create(phone: Partial<Phone>): Promise<Phone | null>;
  findOne(query: Partial<Phone>): Promise<Phone | null>;
  update(id: string, payload: Partial<Phone>): Promise<Phone | null>;
}

@Injectable()
export class PhoneRepository implements IPhoneRepository {
  constructor(
    @InjectModel(PhoneSchema.name)
    private readonly phoneModel: Model<Phone>,
  ) {}

  async create(phone: Partial<Phone>): Promise<Phone | null> {
    const newPhone = new this.phoneModel(phone);
    const createdPhone = await newPhone.save();
    return createdPhone ? (createdPhone.toObject() as unknown as Phone) : null;
  }

  async findOne(query: Partial<Phone>): Promise<Phone | null> {
    const phone = await this.phoneModel.findOne(query).exec();
    return phone ? (phone.toObject() as unknown as Phone) : null;
  }

  async update(id: string, payload: Partial<Phone>): Promise<Phone | null> {
    // Remove campos imutáveis do MongoDB no nível raiz apenas
    const { _id, __v, createdAt, updatedAt, ...safePayload } = payload as any;

    const updatedPhone = await this.phoneModel
      .findByIdAndUpdate(id, { $set: flatten(safePayload) }, { new: true })
      .exec();

    return updatedPhone ? (updatedPhone.toObject() as unknown as Phone) : null;
  }
}
