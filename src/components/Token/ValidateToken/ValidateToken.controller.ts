import { Body, Controller, Post, Res } from '@nestjs/common';
import { ValidateTokenService } from './ValidateToken.service';
import { FastifyReply } from 'fastify';
import { ValidateTokenDTO } from './ValidateToken.dto';

@Controller('validate-token')
export class ValidateTokenController {
    constructor(private readonly validateTokenService: ValidateTokenService) {}

    @Post()
    async handle(
        @Body() validateTokenDTO: ValidateTokenDTO,
        @Res() reply: FastifyReply,
    ): Promise<void> {
        try {
            const token = await this.validateTokenService.execute(validateTokenDTO);
            reply.status(200).send(token);
        } catch (error) {
            reply.status(400).send({
                message: error.message || 'Erro ao validar token',
                statusCode: 400
            });
        }
    }
}
