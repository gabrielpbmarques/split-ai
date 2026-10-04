import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ConvertTextToSpeechDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  text!: string;
}
