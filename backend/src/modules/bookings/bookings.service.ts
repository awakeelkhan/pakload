import { Injectable } from '@nestjs/common';
import { MockDataService } from '../mock-data/mock-data.service';

@Injectable()
export class BookingsService {
  constructor(private mockDataService: MockDataService) {}

  findAll(userId: string, role: string) {
    return this.mockDataService.getAllBookings(userId, role);
  }

  findOne(id: string) {
    return this.mockDataService.getBookingById(id);
  }

  updateStatus(id: string, status: string, notes?: string) {
    return this.mockDataService.updateBooking(id, { status, notes });
  }
}
