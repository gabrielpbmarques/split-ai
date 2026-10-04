import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CheckUserRegisteredDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phone!: string;
}
