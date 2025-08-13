import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { XrayService } from '../xray/xray.service';


@Injectable()
export class RabbitmqService {
    //private readonly logger = new Logger(RabbitmqService.name);

    constructor(private readonly xrayService: XrayService) { }

    static readonly rabbitmq_uri = process.env.NODE_ENV === process.env.TEST_ENV_NAME ? process.env.RABBITMQ_URL_TEST : process.env.RABBITMQ_URL;
    static readonly exchange = process.env.NODE_ENV === process.env.TEST_ENV_NAME ? process.env.RABBITMQ_EXCHANGE_TEST : process.env.RABBITMQ_EXCHANGE;
    static readonly queue = process.env.NODE_ENV === process.env.TEST_ENV_NAME ? process.env.RABBITMQ_QUEUE_TEST : process.env.RABBITMQ_QUEUE;
    static readonly routingKey = process.env.NODE_ENV === process.env.TEST_ENV_NAME ? process.env.RABBITMQ_ROUTING_KEY_TEST : process.env.RABBITMQ_ROUTING_KEY;

    @RabbitSubscribe({
        exchange: RabbitmqService.exchange,
        routingKey: RabbitmqService.routingKey,
        queue: RabbitmqService.queue,
    })

    async handleXrayMessage(msg: any) {
        try {
            const payload = JSON.parse(msg);

            const deviceId = Object.keys(payload)[0];
            const deviceData = payload[deviceId];
            const time = payload.time;
            const dataLength = deviceData.length;

            await this.xrayService.saveXrayData(deviceId, time, dataLength);

        } catch (error) {
            console.error('Error processing x-ray message:', error);
            throw error; // we do this because otherwise the message will not be requeued
        }
    }
}
