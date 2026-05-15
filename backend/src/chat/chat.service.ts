import { AppError, ErrorCode } from "../error/apperror";
import { FriendshipService } from "../friendship/friendship.service";
import { ChatEmitter } from "../websocket/socket.emitter";
import { ChatRepository } from "./chat.repository";
import { ErrorReply } from "redis";

export class ChatService{
    constructor(
        private emitter: ChatEmitter,
        private friendservice: FriendshipService,
        private chatrepo: ChatRepository,
    ){}

    async sendPrivateMessage(fromId: string, toUserId: string, content: string){
        if (!content?.trim()) {
            throw new AppError('Empty message', ErrorCode.BAD_REQUEST, 400);
        }
        if (content.length > 2000) {
            throw new AppError('Message too long', ErrorCode.BAD_REQUEST, 400);
        }
        //check if they are friends 
        const areFriends = this.friendservice.areFriends(Number(fromId), Number(toUserId));
        if (!areFriends){
            throw new AppError('Not friends', ErrorCode.FRIEND_NOT_FOUND, 403);
        }

        //save the message in database
        const message = await this.chatrepo.saveMessage(Number(fromId), Number(toUserId), content);

        //tell toUserId a message received
        await this.emitter.toUser(toUserId, 'message_received', {
            messageId: message.id,
            fromUserId: fromId,
            content,
            createdAt: message.createdAt,
        });

        return message;
    }

    async getHistory(userId: string, withUserId: string, limite= 50, before?: Data){
        const areFriends = await this.friendservice.areFriends(Number(userId), withUserId);
        if (!areFriends){
            throw new AppError('Not friends', ErrorCode.FRIEND_NOT_FOUND, 403);
        }
        return this.chatrepo.getHistory(Number(userId), Number(withUserId), limite, before);
    }

    async markAsRead(userId: string, fromUserId: string){
        return await this.chatrepo.markAsRead(Number(fromUserId), Number(userId));
    }

    
}






/**
 * chat service 
 * 
 * 
 */