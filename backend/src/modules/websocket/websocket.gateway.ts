import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('WebSocketGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_booking')
  handleJoinBooking(
    @MessageBody() bookingId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`booking:${bookingId}`);
    this.logger.log(`Client ${client.id} joined booking ${bookingId}`);
    return { event: 'joined', data: bookingId };
  }

  @SubscribeMessage('leave_booking')
  handleLeaveBooking(
    @MessageBody() bookingId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`booking:${bookingId}`);
    this.logger.log(`Client ${client.id} left booking ${bookingId}`);
    return { event: 'left', data: bookingId };
  }

  // Emit location update to all clients watching a booking
  emitLocationUpdate(bookingId: string, location: any) {
    this.server.to(`booking:${bookingId}`).emit('location_update', {
      bookingId,
      location,
      timestamp: new Date(),
    });
  }

  // Emit booking status update
  emitBookingStatusUpdate(bookingId: string, status: string) {
    this.server.to(`booking:${bookingId}`).emit('status_update', {
      bookingId,
      status,
      timestamp: new Date(),
    });
  }

  // Emit new bid notification
  emitNewBid(loadId: string, bid: any) {
    this.server.emit('new_bid', {
      loadId,
      bid,
      timestamp: new Date(),
    });
  }

  // Emit new load notification
  emitNewLoad(load: any) {
    this.server.emit('new_load', {
      load,
      timestamp: new Date(),
    });
  }
}
