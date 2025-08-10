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
    public async handleXrayData(message: any) {
        this.logger.log('hah ha haaa');
        // Here you can add your processing logic for the x-ray data
    }

    async handleXrayMessage(msg: any) {
        try {
            const payload = JSON.parse(msg.content.toString());

            const deviceId = Object.keys(payload)[0];
            const deviceData = payload[deviceId];

            // TODO: change time after receiving reply email
            const time = deviceData.time;
            const dataLength = deviceData.data.length;

            await this.xrayService.saveXrayData(deviceId, time, dataLength);

        } catch (error) {
            console.error('Error processing x-ray message:', error);
            throw error; // we do this because otherwise the message will not be requeued
        }
    }
}
