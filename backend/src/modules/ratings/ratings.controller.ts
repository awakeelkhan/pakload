import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Ratings')
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit rating for completed booking' })
  create(@Body() createRatingDto: any, @CurrentUser() user: any) {
    return this.ratingsService.create(createRatingDto, user.id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user ratings' })
  findByUser(@Param('userId') userId: string) {
    return this.ratingsService.findByUser(userId);
  }
}
