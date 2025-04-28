import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/repositories/User.repository';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import crypto from 'crypto';

@Injectable()
export class CreateUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly workerRepository: WorkerRepository,
  ) {}

  async execute(worker: any): Promise<any> {
    try {
      if (!worker.email || !worker.name || !worker.password) {
        return worker;
      }

      let workerId = worker._id ? worker._id.toString() : null;

      if (!workerId) {
        const createdWorker = await this.workerRepository.create(worker);
        workerId = createdWorker._id.toString();
        worker._id = createdWorker._id;
      }

      const hashedPassword = await this.hashPassword(worker.password);

      const newUser = await this.userRepository.create({
        name: worker.name,
        email: worker.email,
        password: hashedPassword,
        type: 'worker',
        permissions: [],
        isRemoved: false,
        workerId: workerId,
        createdAt: new Date(),
      });

      const updatedWorker = {
        ...worker,
        userId: newUser._id,
        password: undefined,
      };

      await this.workerRepository.update(
        updatedWorker._id.toString(),
        updatedWorker,
      );

      return updatedWorker;
    } catch (error) {
      return worker;
    }
  }

  private async hashPassword(plainPassword: string): Promise<string> {
    return crypto.createHash('sha256').update(plainPassword).digest('hex');
  }
}
