import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('X-Ray Producer')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('send-xray')
  @ApiOperation({ summary: 'Send sample x-ray data to RabbitMQ' })
  async sendXrayData(@Res() res) {
    const check = await this.appService.sendXrayData();
    if (check) return res.status(200).json({ message: 'X-ray data sent successfully' })
    else return res.status(500).json({ message: 'Failed to send x-ray data' });
  }
}