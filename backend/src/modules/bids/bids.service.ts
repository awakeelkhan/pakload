import { Injectable } from '@nestjs/common';
import { MockDataService } from '../mock-data/mock-data.service';

@Injectable()
export class BidsService {
  constructor(private mockDataService: MockDataService) {}

  findAll(loadId?: string) {
    return this.mockDataService.getAllBids(loadId);
  }

  create(createBidDto: any, carrierId: string) {
    return this.mockDataService.createBid({ ...createBidDto, carrierId });
  }

  accept(id: string) {
    const bid = this.mockDataService.updateBid(id, { status: 'accepted' });
    if (bid) {
      const booking = this.mockDataService.createBooking({
        loadId: bid.loadId,
        shipperId: bid.loadId,
        carrierId: bid.carrierId,
        vehicleId: bid.vehicleId,
        bidId: bid.id,
        agreedAmountUsd: bid.bidAmountUsd,
        agreedAmountPkr: bid.bidAmountPkr,
      });
      return booking;
    }
    return null;
  }
}
