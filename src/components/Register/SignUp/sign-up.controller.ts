import { Controller, Post, Body, ValidationPipe, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { SignUpDto } from './sign-up.dto';
import { SignUpService } from './sign-up.service';

@Controller('sign-up')
export class SignUpController {
  constructor(private readonly signUpService: SignUpService) {}

  @Post()
  async handle(
    @Body(new ValidationPipe()) signUpDto: SignUpDto,
    @Res() res: FastifyReply,
  ) {
    try {
      const result = await this.signUpService.execute(signUpDto);
      return res.status(200).send(result);
    } catch (error: any) {
      console.error('SignUp Error:', error);

      // Log detalhado para debug
      if (error.response?.body) {
        console.error('Error Response Body:', error.response.body);
      }

      // Retornar erro estruturado
      const statusCode = error.status || error.statusCode || 500;
      const message = error.message || 'Erro interno do servidor';

      return res.status(statusCode).send({
        statusCode,
        message,
        error: statusCode >= 500 ? 'Internal Server Error' : 'Bad Request',
      });
    }
  }
}
