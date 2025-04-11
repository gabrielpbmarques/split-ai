import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Phone } from 'src/models/Phone.model';
import { Phone as PhoneSchema } from 'src/schemas/Phone.schema';

@Injectable()
export class PhoneRepository {
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
    return this.phoneModel.findByIdAndUpdate(id, payload, { new: true }).exec();
  }
}
