import { Module } from '@nestjs/common';

import {
  ElevenLabsProvider,
  ELEVEN_LABS_CLIENT,
  ELEVEN_LABS_SERVICE,
} from './eleven-labs.provider';

@Module({
  providers: [...ElevenLabsProvider],
  exports: [ELEVEN_LABS_CLIENT, ELEVEN_LABS_SERVICE],
})
export class ElevenLabsProviderModule {}
