import { IsNotEmpty, IsString } from 'class-validator';

export class StartRegistrationDto {
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}
