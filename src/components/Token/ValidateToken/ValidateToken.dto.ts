import type { TokenType } from 'src/types/TokenType';

export class ValidateTokenDTO {
  activityId: string;
  token: string;
  type: TokenType;
}
