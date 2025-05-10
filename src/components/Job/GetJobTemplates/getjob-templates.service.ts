import { Injectable } from '@nestjs/common';
import { Job } from 'src/models/Job.model';
import { JobRepository } from 'src/repositories/Job.repository';

@Injectable()
export class GetjobTemplatesService {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(companyId: string): Promise<Job[]> {
    const pipeline = [
      {
        $match: {
          companyId,
          isTemplate: true,
          templateActiveInPanel: true,
        },
      },
      {
        $lookup: {
          from: 'certificationgroups',
          let: { certGroupId: { $toObjectId: '$certificationGroupId' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$certGroupId'] } } },
            // Projetar apenas os campos necessários
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ],
          as: 'certificationGroup',
        },
      },
      {
        $unwind: {
          path: '$certificationGroup',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          'certificationGroup.__typename': 'CertificationGroup',
        },
      },
      {
        $lookup: {
          from: 'productgroups',
          let: { prodGroupId: { $toObjectId: '$productGroupId' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$prodGroupId'] } } },
            // Projetar apenas os campos necessários
            {
              $project: {
                _id: 1,
                name: 1,
                price: 1,
                products: 1,
              },
            },
          ],
          as: 'productGroup',
        },
      },
      { $unwind: { path: '$productGroup', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          'productGroup.__typename': 'ProductGroup',
          'productGroup.products': {
            $map: {
              input: '$productGroup.products',
              as: 'product',
              in: {
                _id: '$$product._id',
                __typename: 'Product',
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          templateTitle: 1,
          templateActiveInPanel: 1,
          certificationGroupId: 1,
          price: 1,
          videoUri: 1,
          description: 1,
          missionType: 1,
          workerPrice: 1,
          companyExigence: 1,
          jobType: 1,
          productGroup: 1,
          certificationGroup: 1,
        },
      },
    ];

    const jobs = await this.jobRepository.aggregate(pipeline);

    return jobs;
  }
}
