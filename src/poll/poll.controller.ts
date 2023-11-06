import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('poll')
export class PollController {
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getPollData() {
    return 'Poll data';
  }
}
