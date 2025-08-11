import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('send-xray')
  sendXrayData() {
    this.appService.sendXrayData();
    return { message: 'X-ray data sent successfully' };
  }
}