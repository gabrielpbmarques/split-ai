import { IsNotEmpty, IsUUID } from 'class-validator';

export class RemoveMemberDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}
