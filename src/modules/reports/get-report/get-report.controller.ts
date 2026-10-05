import { Controller, Get, Param, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { GetReportService } from 'src/modules/reports/get-report/get-report.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('reports')
@Controller('report')
export class GetReportController {
  constructor(private readonly getReportService: GetReportService) {}

  @Get(':id')
  @RequirePermissions('report.read')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(@Param('id') id: string, @Res() res: FastifyReply) {
    const report = await this.getReportService.execute(id);
    return res.status(200).send(report);
  }
}
