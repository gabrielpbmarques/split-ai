import { Injectable, Logger } from '@nestjs/common';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { UserRepository } from 'src/repositories/User.repository';

@Injectable()
export class VerifyExistingUserService {
  constructor(
    private readonly workerRepository: WorkerRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(worker: any, email?: string, cpf?: string): Promise<any> {
    if (!email && !cpf) {
      return worker;
    }

    let query = {};

    if (email) query = { ...query, email };
    if (cpf) query = { ...query, cpf };

    const existingUser = await this.userRepository.findOne(query);

    if (!existingUser) {
      return worker;
    }

    const existingWorker = await this.workerRepository.findOne({
      userId: existingUser.id,
    });

    if (existingWorker) {
      return {
        ...existingWorker,
        ...worker,
      };
    } else {
      return {
        ...worker,
        userId: existingUser.id,
        name: worker.name || existingUser.name,
        email: worker.email || existingUser.email,
      };
    }
  }
}
