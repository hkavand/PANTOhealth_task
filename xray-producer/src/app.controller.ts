import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('X-Ray Producer')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('send-xray')
  @ApiOperation({ summary: 'Send sample x-ray data to RabbitMQ' })
  sendXrayData() {
    this.appService.sendXrayData();
    return { message: 'X-ray data sent successfully' };
  }
}