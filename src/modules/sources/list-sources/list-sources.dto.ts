import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { PaginationDto } from 'src/shared/http/pagination.dto';

export class ListSourcesDto extends PaginationDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  agent_id!: string;
}
