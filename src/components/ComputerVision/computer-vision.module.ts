import { Module } from '@nestjs/common';
import { FaceMatchModule } from './FaceMatch/face-match.module';

@Module({
  imports: [FaceMatchModule],
  exports: [FaceMatchModule],
})
export class ComputerVisionModule {}
