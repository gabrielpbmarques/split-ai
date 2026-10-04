import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AcceptInviteDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
