import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { AttendantService } from 'src/modules/chat/attendant/attendant.service';
import { QuestionDto } from 'src/modules/chat/question/question.dto';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@ApiTags('chat')
@Controller('chat')
export class AttendantController {
  constructor(private readonly attendantService: AttendantService) {}

  @Post('attendant')
  @RequirePermissions('chat.attend')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @Body() dto: QuestionDto,
    @AuthUser() user: AuthenticatedUser,
  ) {
    const result = await this.attendantService.execute(dto, user);
    return res.status(200).send(result);
  }
}
