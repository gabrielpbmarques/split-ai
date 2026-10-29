import { Module } from '@nestjs/common';

import { AntiPersonalLeakService } from 'src/modules/subagents/anti-personal-leak/anti-personal-leak.service';

@Module({
  providers: [AntiPersonalLeakService],
  exports: [AntiPersonalLeakService],
})
export class AntiPersonalLeakModule {}
