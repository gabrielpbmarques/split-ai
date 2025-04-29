import { IsNotEmpty, IsUrl } from 'class-validator';

export class TestOcrDto {
  @IsNotEmpty()
  @IsUrl()
  frontImageUrl: string;

  @IsNotEmpty()
  @IsUrl()
  backImageUrl: string;
}
