import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { XrayService } from '../xray/xray.service';


@Injectable()
export class RabbitmqService {
    private readonly logger = new Logger(RabbitmqService.name);

    constructor(private readonly xrayService: XrayService) { }

    @RabbitSubscribe({
        exchange: 'xray_exchange',
        routingKey: 'xray_data',
        queue: 'xray_queue',
    })

    async handleXrayMessage(msg: any) {
        try {
            this.logger.log(`Received message: processing...`);
            const payload = JSON.parse(msg);

            const deviceId = Object.keys(payload)[0];
            const deviceData = payload[deviceId];
            const time = payload.time;
            const dataLength = deviceData.length;

            this.logger.log(`Done processing message: deviceId=${deviceId}, time=${time}, dataLength=${dataLength}`);
            await this.xrayService.saveXrayData(deviceId, time, dataLength);

        } catch (error) {
            console.error('Error processing x-ray message:', error);
            throw error; // we do this because otherwise the message will not be requeued
        }
    }
}
