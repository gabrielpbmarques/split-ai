import { Module } from '@nestjs/common';
import { FaceMatchService } from 'src/components/Document/FaceMatch/face-match.service';

@Module({
  providers: [FaceMatchService],
})
export class FaceMatchModule {}
