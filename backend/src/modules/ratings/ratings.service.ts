import { Injectable } from '@nestjs/common';
import { MockDataService } from '../mock-data/mock-data.service';

@Injectable()
export class RatingsService {
  constructor(private mockDataService: MockDataService) {}

  create(createRatingDto: any, reviewerId: string) {
    return this.mockDataService.createRating({ ...createRatingDto, reviewerId });
  }

  findByUser(userId: string) {
    return this.mockDataService.getRatingsByUser(userId);
  }
}
