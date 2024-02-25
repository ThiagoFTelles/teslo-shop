import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';

import { Server, Socket } from 'socket.io';

import { JwtPayload } from '../auth/interfaces';
import { MessagesWsService } from './messages-ws.service';
import { EventNames } from './interfaces';
import { NewMessageDto } from './dtos/new-message.dto';

@WebSocketGateway({ cors: true, namespace: '/' })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  wss: Server

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection( client: Socket ) {
    const token = client.handshake.headers.authentication as string
    let payload: JwtPayload
    try {
      payload = this.jwtService.verify( token )
    } catch (error) {
      client.disconnect()
      return
    }

    console.log({ payload })

    this.messagesWsService.registerClient( client )
    this.wss.emit(EventNames.clientsUpdated, this.messagesWsService.getConnectedClients())
    // TODO: learn about: 
    // client.join('roomName') -> insert the user in a romm
    // this.wss.to('roomName').emit('my message') -> emits only for clients in this room
    // client.join(user.id) -> uses the id as a room name
    // client.join(user.email) ...etc
  }

  handleDisconnect( client: Socket ) {
    this.messagesWsService.removeClient( client.id )
    this.wss.emit(EventNames.clientsUpdated, this.messagesWsService.getConnectedClients())
  }
  
  @SubscribeMessage(EventNames.messageFromClient)
  onMessageFromClient( client: Socket, payload: NewMessageDto ) {
    // emits only to this client
    // client.emit(EventNames.messageFromServer, {
    //   userId: '123123123',
    //   message: payload.message || 'empty message.'
    // })

    // emits for all except this client
    // client.broadcast.emit(EventNames.messageFromServer, {
    //   userId: '123123123',
    //   message: payload.message || 'empty message.'
    // })

    // emits for everybody
    this.wss.emit(EventNames.messageFromServer, {
        userName: 'Username',
        message: payload.message || 'empty message.'
      })
  }
}
