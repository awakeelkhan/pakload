import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MockDataService } from '../mock-data/mock-data.service';

@Injectable()
export class LoadsService {
  constructor(private mockDataService: MockDataService) {}

  findAll(filters?: any) {
    const loads = this.mockDataService.getAllLoads(filters);
    return {
      data: loads,
      total: loads.length,
      page: filters?.page || 1,
      limit: filters?.limit || 20,
    };
  }

  findOne(id: string) {
    const load = this.mockDataService.getLoadById(id);
    if (!load) {
      throw new NotFoundException('Load not found');
    }
    return load;
  }

  create(createLoadDto: any, userId: string) {
    return this.mockDataService.createLoad({
      ...createLoadDto,
      userId,
    });
  }

  update(id: string, updateLoadDto: any, userId: string) {
    const load = this.mockDataService.getLoadById(id);
    if (!load) {
      throw new NotFoundException('Load not found');
    }
    if (load.userId !== userId) {
      throw new ForbiddenException('You can only update your own loads');
    }
    return this.mockDataService.updateLoad(id, updateLoadDto);
  }

  remove(id: string, userId: string) {
    const load = this.mockDataService.getLoadById(id);
    if (!load) {
      throw new NotFoundException('Load not found');
    }
    if (load.userId !== userId) {
      throw new ForbiddenException('You can only delete your own loads');
    }
    this.mockDataService.deleteLoad(id);
    return { message: 'Load deleted successfully' };
  }
}
