import {ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import {WsService} from './ws.service';
import {Server, Socket} from "socket.io"


@WebSocketGateway({
    extraHeaders: {},
    cors: {
        origin: '*',
    }
})
export class WsGateway {
    constructor(private readonly wsService: WsService) {
    }

    @WebSocketServer()
    server: Server;

    @SubscribeMessage('like')
    like(@MessageBody() body: { room: string, userOnlineId: string, fromOnlineId: string }, @ConnectedSocket() socket: Socket) {
        this.wsService.like(body);
        socket.emit("liked", body)
        socket.to(body.room).emit('liked', body)
    }

    @SubscribeMessage('likeBack')
    likeBack(@MessageBody() body: { room: string, userOnlineId: string, fromOnlineId: string }, @ConnectedSocket() socket: Socket) {
        this.wsService.likeBack(body)
        socket.to(body.room).emit('likedBack', body)
    }

    @SubscribeMessage('getRoomLikes')
    getRoomLikes(@MessageBody() room: string, @ConnectedSocket() socket: Socket) {
        const likesOfRoom = this.wsService.getLikesOfRoom(room)
        socket.to(room).emit('roomLikes', likesOfRoom)
    }

    @SubscribeMessage('joinRoom')
    async joinRoom(@MessageBody() body: { room: string, userId?: string, displayName?: string }, @ConnectedSocket() socket: Socket) {
        if (body.userId && !body.displayName) {
            await this.wsService.attendToRoom(socket, body.room, body.userId)
        } else if (body.displayName && !body.userId) {
            await this.wsService.attendToRoom(socket, body.room, undefined, body.displayName)
        }
    }

    @SubscribeMessage('leaveRoom')
    async leaveRoom(@MessageBody() body: { room: string, userOnlineId: string}, @ConnectedSocket() socket: Socket) {
            await this.wsService.leaveRoom(socket, body.room, body.userOnlineId)
    }

    @SubscribeMessage('addPoint')
    async addPoint(@MessageBody() body: { user: string, room: string, point: number }, @ConnectedSocket() socket: Socket) {
        await this.wsService.addPoint(socket, body)
    }

    @SubscribeMessage('subPoint')
    async subPoint(@MessageBody() body: { user: string, room: string, point: number }, @ConnectedSocket() socket: Socket) {
        await this.wsService.subPoint(socket, body)
    }

    @SubscribeMessage('closeRoom')
    async closeRoom(@MessageBody() body: { room: string }, @ConnectedSocket() socket: Socket) {
        await this.wsService.closeRoom(socket, body.room)
    }

}