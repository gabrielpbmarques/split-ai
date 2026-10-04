import {
  Controller,
  Get,
  Query,
  UseGuards,
  ForbiddenException,
  Res,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/entities';

import { GetTokenUsageDto } from './get-token-usage.dto';
import { GetTokenUsageService } from './get-token-usage.service';

@Controller('token-usage')
export class GetTokenUsageController {
  constructor(private readonly getTokenUsageService: GetTokenUsageService) {}

  @Get()
  @UseGuards(AuthGuard)
  async execute(
    @Query() dto: GetTokenUsageDto,
    @AuthUser() user: UserEntity,
    @Res() res: FastifyReply,
  ) {
    const isAdmin = user.role === 'admin';

    if (!isAdmin) {
      if (!user.organization_id) {
        throw new ForbiddenException(
          'User does not belong to an organization and cannot view token usage.',
        );
      }
    }

    const result = await this.getTokenUsageService.execute(
      dto,
      user.organization_id,
    );

    return res.status(200).send(result);
  }
}
