import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Picture, PictureDocument } from '../models/Picture.model';

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
}
