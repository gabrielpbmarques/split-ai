import { Module } from '@nestjs/common';

import { ElevenLabsProvider } from 'src/infrastructure/eleven-labs/eleven-labs.provider';
import {
  ELEVEN_LABS_CLIENT,
  ELEVEN_LABS_SERVICE,
} from 'src/infrastructure/eleven-labs/eleven-labs.tokens';

@Module({
  providers: [...ElevenLabsProvider],
  exports: [ELEVEN_LABS_CLIENT, ELEVEN_LABS_SERVICE],
})
export class ElevenLabsProviderModule {}
