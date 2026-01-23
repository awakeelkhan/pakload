import { Injectable } from '@nestjs/common';
import { MockDataService } from '../mock-data/mock-data.service';

@Injectable()
export class NotificationsService {
  constructor(private mockDataService: MockDataService) {}

  findAll(userId: string, unreadOnly = false) {
    return this.mockDataService.getUserNotifications(userId, unreadOnly);
  }

  markAsRead(id: string) {
    return this.mockDataService.markNotificationAsRead(id);
  }

  markAllAsRead(userId: string) {
    return this.mockDataService.markAllNotificationsAsRead(userId);
  }
}
