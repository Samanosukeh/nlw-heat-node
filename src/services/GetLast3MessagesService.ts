import prismaClient from "../prisma";

class GetLast3MessagesService {
    async execute() {
        const messages = await prismaClient.message.findMany({
            take: 3, // 3 ultimas
            orderBy: {
                create_at: "desc"
            },
            include: {
                user: true
            }
        });
        // select * from messages order by created_at desc limit 3
        return messages;
    }
}

export { GetLast3MessagesService }