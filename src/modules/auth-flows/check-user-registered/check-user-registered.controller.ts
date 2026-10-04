import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { CheckUserRegisteredDto } from 'src/modules/auth-flows/check-user-registered/check-user-registered.dto';
import { CheckUserRegisteredService } from 'src/modules/auth-flows/check-user-registered/check-user-registered.service';
import { Public } from 'src/shared/decorators/public.decorator';

@ApiTags('auth-flows')
@Controller('auth')
export class CheckUserRegisteredController {
  constructor(
    private readonly checkUserRegisteredService: CheckUserRegisteredService,
  ) {}

  @Post('check-user-registered')
  @Public()
  @ApiOkResponse()
  async handle(@Res() res: FastifyReply, @Body() body: CheckUserRegisteredDto) {
    const result = await this.checkUserRegisteredService.execute(body.phone);

    return res.status(200).send({
      success: true,
      data: result,
    });
  }
}
