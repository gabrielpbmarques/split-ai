import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class TestFaceMatchDto {
  @IsNotEmpty()
  @IsString()
  @IsUrl({}, { message: 'documentImageUrl deve ser uma URL válida' })
  documentImageUrl: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl({}, { message: 'selfieImageUrl deve ser uma URL válida' })
  selfieImageUrl: string;
}
