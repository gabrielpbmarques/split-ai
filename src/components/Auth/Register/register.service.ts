import { Injectable } from '@nestjs/common';

@Injectable()
export class RegisterService {
  constructor() {}

  async execute(payload: any): Promise<any> {
    console.log('Received payload:', payload);

    return { message: 'Payload processed successfully' };
  }
}
