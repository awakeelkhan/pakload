import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BidsService } from './bids.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Bids')
@Controller('bids')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Get()
  @ApiOperation({ summary: 'Get bids for a load' })
  findAll(@Query('loadId') loadId?: string) {
    return this.bidsService.findAll(loadId);
  }

  @Post()
  @ApiOperation({ summary: 'Place a bid on a load' })
  create(@Body() createBidDto: any, @CurrentUser() user: any) {
    return this.bidsService.create(createBidDto, user.id);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept a bid (shipper only)' })
  accept(@Param('id') id: string) {
    return this.bidsService.accept(id);
  }
}
