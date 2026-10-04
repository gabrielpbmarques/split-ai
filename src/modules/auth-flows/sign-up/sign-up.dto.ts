import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum UserType {
  USER = 'user',
  ADMIN = 'admin',
}

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  phone!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  organization!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(128)
  confirmPassword!: string;
}

export class VerifyEmailDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  token!: string;
}
