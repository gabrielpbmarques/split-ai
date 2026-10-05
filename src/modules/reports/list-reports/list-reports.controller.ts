import { Controller, Get, Query, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { ListReportsDto } from 'src/modules/reports/list-reports/list-reports.dto';
import { ListReportsService } from 'src/modules/reports/list-reports/list-reports.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('reports')
@Controller('report')
export class ListReportsController {
  constructor(private readonly listReportsService: ListReportsService) {}

  @Get()
  @RequirePermissions('report.read')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @Query() dto: ListReportsDto,
  ): Promise<FastifyReply> {
    const result = await this.listReportsService.execute(dto);
    return res.status(200).send(result);
  }
}
