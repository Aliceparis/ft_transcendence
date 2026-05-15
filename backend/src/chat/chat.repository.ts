import { PrismaClient } from "@prisma/client/extension";


export class ChatRepository{
    constructor(
        private prisma: PrismaClient
    ){}

    // save a message
    async saveMessage(fromId: number, toUserId: number, content: string){
        await this.prisma.create({
            data:{
                senderId: fromId,
                receiverId: toUserId,
                content,
            },
            include: {
                sender: {select: {id: true, username: true}}
            }
        })
    }

    //get history 
    async getHistory(userAId: number, userBId: number, limit = 50, before?: Date){
        return this.prisma.findMany({
            where: {
                OR: [
                    {senderId: userAId, receiverId: userBId},
                    {senderId: userBId, receiverId: userAId},
                ],
                ...(before && { createdAt: { lt: before } })
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                sender: { select: { id: true, username: true } }
            }
        });
    }
    

    //mark the message has read 
    async markAsRead(fromId: number, toUserId: number){
        return this.prisma.updateMany({
            where: {senderId: fromId, receiverId: toUserId, read: false},
            data: {read: true}
        })
    }
    //
    async getUnreadCount(userId: number) {
        return this.prisma.message.groupBy({
            by: ['senderId'],
            where: { receiverId: userId, read: false },
            _count: { id: true }
        });
    }
}