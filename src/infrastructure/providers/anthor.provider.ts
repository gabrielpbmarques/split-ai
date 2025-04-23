import { Anthor } from '@anthor/entities-sdk';
import { Provider } from '@nestjs/common';

export const ANTHOR_CLIENT = 'ANTHOR_CLIENT';

export const AnthorProvider: Provider = {
  provide: ANTHOR_CLIENT,
  useFactory: () => new Anthor(),
};
