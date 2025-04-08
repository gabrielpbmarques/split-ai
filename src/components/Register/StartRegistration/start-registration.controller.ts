import { Body, Controller, Post } from '@nestjs/common';
import { StartRegistrationService } from './start-registration.service';
import { StartRegistrationDto } from './start-registration.dto';

@Controller('register')
export class StartRegistrationController {
  constructor(
    private readonly startRegistrationService: StartRegistrationService,
  ) {}

  @Post('start')
  async execute(@Body() startRegistrationDto: StartRegistrationDto) {
    return this.startRegistrationService.execute(startRegistrationDto);
  }
}
