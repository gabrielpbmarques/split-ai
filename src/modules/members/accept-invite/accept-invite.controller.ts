import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { AcceptInviteDto } from 'src/modules/members/accept-invite/accept-invite.dto';
import { AcceptInviteService } from 'src/modules/members/accept-invite/accept-invite.service';
import { Public } from 'src/shared/decorators/public.decorator';

@ApiTags('members')
@Controller('organization/members')
export class AcceptInviteController {
  constructor(private readonly acceptInviteService: AcceptInviteService) {}

  @Post('accept')
  @Public()
  @ApiOkResponse()
  async handle(
    @Res() res: FastifyReply,
    @Body() dto: AcceptInviteDto,
  ): Promise<FastifyReply> {
    const result = await this.acceptInviteService.execute(dto);
    return res.status(200).send(result);
  }
}
