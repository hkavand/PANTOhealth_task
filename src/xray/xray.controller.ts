import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { XrayService } from './xray.service';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';


@ApiTags('Xrays')
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
    @ApiOperation({ summary: 'Filter x-rays by deviceId and time' })
    @ApiQuery({ name: 'deviceId', description: 'The device ID to filter by', required: false })
    @ApiQuery({ name: 'time', description: 'The time to filter by', required: false, type: Number })
    async filterXrays(@Query('deviceId') deviceId: string, @Query('time') time: number) {
        return this.xrayService.filterXrays(deviceId, time);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new x-ray' })
    @ApiBody({
        description: 'The x-ray data to create',
        schema: {
            example: {
                "66bb584d4ae73e488c30a072": {
                    "data": [1, 2, 3, 4],
                    "time": 1735683480000
                }
            }
        },
    })
    async createXray(@Body() body: Record<string, { data: number[]; time: number }>) {
        const { deviceId, time, dataLength } = this.validate(body);

        return this.xrayService.saveXrayData(deviceId, time, dataLength);
    }

    @Get()
    @ApiOperation({ summary: 'Get all x-rays' })
    async getAllXrays() {
        return this.xrayService.getAllXrays();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an x-ray by ID' })
    @ApiParam({ name: 'id', description: 'The ID of the x-ray', type: String })
    async getXrayById(@Param('id') id: string) {
        return this.xrayService.getXrayById(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update an x-ray by ID' })
    @ApiParam({ name: 'id', description: 'The ID of the x-ray', type: String })
    @ApiBody({
        description: 'The x-ray data to update',
        schema: {
            example: {
                "66bb584d4ae73e488c30a072": {
                    "data": [1, 2, 3, 4],
                    "time": 1735683480000
                }
            }
        },
    })
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
    @ApiOperation({ summary: 'Delete an x-ray by ID' })
    @ApiParam({ name: 'id', description: 'The ID of the x-ray', type: String })
    async deleteXray(@Param('id') id: string) {
        return this.xrayService.deleteXray(id);
    }
}
