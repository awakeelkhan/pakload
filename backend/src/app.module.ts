import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { LoadsModule } from './modules/loads/loads.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { BidsModule } from './modules/bids/bids.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MockDataModule } from './modules/mock-data/mock-data.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per minute
      },
    ]),

    // Feature Modules
    MockDataModule,
    AuthModule,
    UsersModule,
    LoadsModule,
    VehiclesModule,
    BidsModule,
    BookingsModule,
    TrackingModule,
    RatingsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
