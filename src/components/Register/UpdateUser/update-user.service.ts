import { Injectable } from '@nestjs/common';
import { User } from 'src/models/User.model';
import { UserRepository } from 'src/repositories/User.repository';
import { createHash } from 'crypto';

type UpdateUserPayload = Pick<User, 'name' | 'email' | 'password'>;

@Injectable()
export class UpdateUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    payload: Partial<UpdateUserPayload>,
    workerId: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ workerId });

    if (!user) {
      const userPayload: User = {
        workerId,
        name: payload.name,
        email: payload.email,
        type: 'worker',
        password: payload.password
          ? this.encryptPassword(payload.password)
          : undefined,
      };

      const newUser = await this.userRepository.create(userPayload);

      return newUser as unknown as User;
    }

    const updatedUser = await this.userRepository.updateByWorkerId(
      workerId,
      payload,
    );

    return updatedUser as unknown as User;
  }

  private encryptPassword(password: string): string {
    return createHash('md5').update(password).digest('hex');
  }
}
