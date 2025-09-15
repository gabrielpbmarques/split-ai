import { IsNotEmpty, IsString } from 'class-validator';

export class ConvertTextToSpeechDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}
