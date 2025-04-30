import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Picture, PictureDocument } from 'src/models/Picture.model';
import { flatten } from 'src/utils/mongoose.utils';

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
    const picture = await this.pictureModel.findById(id).exec();
    return picture ? (picture.toObject() as unknown as PictureDocument) : null;
  }

  async findByWorkerId(workerId: string): Promise<PictureDocument[]> {
    const pictures = await this.pictureModel.find({ workerId }).exec();
    return pictures.map(
      (picture) => picture.toObject() as unknown as PictureDocument,
    );
  }

  async update(
    id: string,
    picture: Partial<Picture>,
  ): Promise<PictureDocument | null> {
    // Remove campos imutáveis do MongoDB
    const { _id, __v, createdAt, updatedAt, ...safePayload } = picture as any;

    const updatedPicture = await this.pictureModel
      .findByIdAndUpdate(id, { $set: flatten(safePayload) }, { new: true })
      .exec();

    return updatedPicture
      ? (updatedPicture.toObject() as unknown as PictureDocument)
      : null;
  }
}
