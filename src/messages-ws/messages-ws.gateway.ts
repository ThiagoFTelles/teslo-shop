import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { MessagesWsService } from './messages-ws.service';
import { EventNames } from './interfaces';

@WebSocketGateway({ cors: true, namespace: '/' })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  wss: Server

  constructor(private readonly messagesWsService: MessagesWsService) {}

  handleConnection( client: Socket ) {
    this.messagesWsService.registerClient( client )
    this.wss.emit(EventNames.clientsUpdated, this.messagesWsService.getConnectedClients())
  }
  handleDisconnect( client: Socket ) {
    this.messagesWsService.removeClient( client.id )
    this.wss.emit(EventNames.clientsUpdated, this.messagesWsService.getConnectedClients())
  }
}
