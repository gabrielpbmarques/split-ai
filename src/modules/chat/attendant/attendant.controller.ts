import { Body, Controller, Post, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { AttendantService } from 'src/modules/chat/attendant/attendant.service';
import { QuestionDto } from 'src/modules/chat/question/question.dto';
import { RequireActiveOrganization } from 'src/shared/decorators/active-organization.decorator';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@Controller('chat')
export class AttendantController {
  constructor(private readonly attendantService: AttendantService) {}

  @Post('attendant')
  @RequirePermissions('chat.attend')
  @RequireActiveOrganization()
  async handle(
    @Res() res: FastifyReply,
    @Body() dto: QuestionDto,
    @AuthUser() user: AuthenticatedUser,
  ) {
    const result = await this.attendantService.execute(dto, user);
    return res.status(200).send(result);
  }
}
