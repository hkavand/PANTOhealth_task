import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { XrayService } from './xray.service';

@Controller('xrays')
export class XrayController {
    constructor(private readonly xrayService: XrayService) { }


    private validate(body: Record<string, { data: number[]; time: number }>) {
        if (!body || Object.keys(body).length === 0) {
            throw new Error('Invalid payload: body is empty');
        }

        const deviceId = Object.keys(body)[0];
        const deviceData = body[deviceId];

        if (!deviceId || !deviceData || !deviceData.time || !deviceData.data) {
            throw new Error('Invalid payload: deviceId, time, or data is missing');
        }
        const time = deviceData.time;
        const dataLength = deviceData.data.length;

        return { deviceId, time, dataLength };
    }

    @Get('filter')
    async filterXrays(@Query('deviceId') deviceId: string, @Query('time') time: number) {
        return this.xrayService.filterXrays(deviceId, time);
    }

    @Post()
    async createXray(@Body() body: Record<string, { data: number[]; time: number }>) {
        const { deviceId, time, dataLength } = this.validate(body);

        return this.xrayService.saveXrayData(deviceId, time, dataLength);
    }

    @Get()
    async getAllXrays() {
        return this.xrayService.getAllXrays();
    }

    @Get(':id')
    async getXrayById(@Param('id') id: string) {
        return this.xrayService.getXrayById(id);
    }

    @Put(':id')
    async updateXray(
        @Param('id') id: string,
        @Body() body: Record<string, { data: number[]; time: number }>,
    ) {
        const { deviceId, time, dataLength } = this.validate(body);
        const updatedXray = await this.xrayService.updateXray(id, {
            deviceId, time, dataLength
        });

        if (!updatedXray) {
            throw new Error(`Xray with ID ${id} not found`);
        }
        return {
            message: `Xray with ID ${id} successfully updated`,
            updatedXray,
        };
    }

    @Delete(':id')
    async deleteXray(@Param('id') id: string) {
        return this.xrayService.deleteXray(id);
    }
}
