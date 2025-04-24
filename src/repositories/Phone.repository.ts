import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Phone } from 'src/models/Phone.model';
import { Phone as PhoneSchema } from 'src/schemas/Phone.schema';
import { removeMongooseFields } from 'src/utils/mongoose.utils';

export interface IPhoneRepository {
  create(phone: Partial<Phone>): Promise<Phone>;
  findOne(query: Partial<Phone>): Promise<Phone>;
  update(id: string, payload: Partial<Phone>): Promise<Phone>;
}

@Injectable()
export class PhoneRepository implements IPhoneRepository {
  constructor(
    @InjectModel(PhoneSchema.name)
    private readonly phoneModel: Model<Phone>,
  ) {}

  async create(phone: Partial<Phone>): Promise<Phone> {
    const newPhone = new this.phoneModel(phone);
    return newPhone.save();
  }

  async findOne(query: Partial<Phone>): Promise<Phone> {
    return this.phoneModel.findOne(query).exec();
  }

  async update(id: string, payload: Partial<Phone>): Promise<Phone> {
    // Remove campos imutáveis do MongoDB
    const safePayload = removeMongooseFields(payload);
    return this.phoneModel
      .findByIdAndUpdate(id, safePayload, { new: true })
      .exec();
  }
}
