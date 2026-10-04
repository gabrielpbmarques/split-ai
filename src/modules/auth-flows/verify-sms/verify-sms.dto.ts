import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class VerifySmsDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10,13}$/, {
    message: 'Telefone deve conter apenas números (10-13 dígitos)',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Código deve ter exatamente 6 dígitos' })
  @Matches(/^\d{6}$/, { message: 'Código deve conter apenas números' })
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  userId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;
}
