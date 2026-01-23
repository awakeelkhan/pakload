import { Injectable } from '@nestjs/common';
import { MockDataService } from '../mock-data/mock-data.service';

@Injectable()
export class TrackingService {
  constructor(private mockDataService: MockDataService) {}

  findByTrackingNumber(trackingNumber: string) {
    return this.mockDataService.getBookingByTrackingNumber(trackingNumber);
  }

  updateLocation(bookingId: string, locationData: any) {
    return this.mockDataService.updateBooking(bookingId, {
      currentLocationLat: locationData.latitude,
      currentLocationLng: locationData.longitude,
      currentLocationAddress: locationData.address,
      lastLocationUpdate: new Date(),
    });
  }
}
