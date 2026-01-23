import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LoadsService } from './loads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Loads')
@Controller('loads')
export class LoadsController {
  constructor(private readonly loadsService: LoadsService) {}

  @Get()
  @ApiOperation({ summary: 'Search and filter loads' })
  findAll(@Query() filters: any) {
    return this.loadsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get load by ID' })
  findOne(@Param('id') id: string) {
    return this.loadsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new load' })
  create(@Body() createLoadDto: any, @CurrentUser() user: any) {
    return this.loadsService.create(createLoadDto, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update load' })
  update(@Param('id') id: string, @Body() updateLoadDto: any, @CurrentUser() user: any) {
    return this.loadsService.update(id, updateLoadDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete load' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.loadsService.remove(id, user.id);
  }
}
