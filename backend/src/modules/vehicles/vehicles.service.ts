import { Injectable } from '@nestjs/common';
import { MockDataService } from '../mock-data/mock-data.service';

@Injectable()
export class VehiclesService {
  constructor(private mockDataService: MockDataService) {}

  findAll(userId?: string) {
    return this.mockDataService.getAllVehicles(userId);
  }

  findOne(id: string) {
    return this.mockDataService.getVehicleById(id);
  }

  create(createVehicleDto: any, userId: string) {
    return this.mockDataService.createVehicle({ ...createVehicleDto, userId });
  }
}
