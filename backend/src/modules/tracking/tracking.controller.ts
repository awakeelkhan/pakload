import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TrackingService } from './tracking.service';

@ApiTags('Tracking')
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get(':trackingNumber')
  @ApiOperation({ summary: 'Track shipment by tracking number' })
  findByTrackingNumber(@Param('trackingNumber') trackingNumber: string) {
    return this.trackingService.findByTrackingNumber(trackingNumber);
  }

  @Post('location')
  @ApiOperation({ summary: 'Update current location (carrier only)' })
  updateLocation(@Body() updateLocationDto: any) {
    return this.trackingService.updateLocation(
      updateLocationDto.bookingId,
      updateLocationDto,
    );
  }
}
