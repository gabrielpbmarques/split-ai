import { Module } from '@nestjs/common';
import { TestFaceMatchController } from './test-face-match.controller';
import { TestFaceMatchService } from './test-face-match.service';
import { FaceMatchModule } from 'src/components/Document/FaceMatch/face-match.module';

@Module({
  imports: [FaceMatchModule],
  controllers: [TestFaceMatchController],
  providers: [TestFaceMatchService],
})
export class TestFaceMatchModule {}
