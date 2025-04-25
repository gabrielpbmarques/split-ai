import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Picture, PictureDocument } from 'src/models/Picture.model';
import { removeMongooseFields } from '../utils/mongoose.utils';

@Injectable()
export class PictureRepository {
  constructor(
    @InjectModel(Picture.name) private pictureModel: Model<PictureDocument>,
  ) {}

  async create(picture: Partial<Picture>): Promise<PictureDocument> {
    const createdPicture = new this.pictureModel(picture);
    return createdPicture.save();
  }

  async findById(id: string): Promise<PictureDocument | null> {
    return this.pictureModel.findById(id).exec();
  }

  async findByWorkerId(workerId: string): Promise<PictureDocument[]> {
    return this.pictureModel.find({ workerId }).exec();
  }

  async update(
    id: string,
    picture: Partial<Picture>,
  ): Promise<PictureDocument | null> {
    const sanitizedPicture = removeMongooseFields(picture);
    return this.pictureModel
      .findByIdAndUpdate(id, sanitizedPicture, { new: true })
      .exec();
  }
}
