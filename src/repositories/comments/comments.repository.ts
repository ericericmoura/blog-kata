import { db } from "@/prisma/db";
import type { Comment, CommentForCreation, CommentsQueryOptions, CommentsRepository } from "./comments.repository.interface";

export class PrismaCommentsRepository implements CommentsRepository {
    async getMany(options: CommentsQueryOptions): Promise<Comment[]> {
        let query = db.orm.public.Comments
            .limit (options.limit ?? 10)
            .offset(options.skip  ?? 0 )
            .orderBy([
                c => c.createdAt.desc(),
                c => c.id.desc(),
            ]);
        
        if (options.postId) query = query.where({ postId: options.postId });
        if (options.userId) query = query.where({ userId: options.userId });

        return await query.all();
    }

    async createMany(input: { userId: number, postId: number; comments: string[]; }): Promise<Comment[]> {
        const comments = input.comments.map(c => ({
            userId: input.userId,
            postId: input.postId,
            body  : c
        }));

        return await db.orm.public.Comments.createAll(comments);
    }

    async create(comment: CommentForCreation): Promise<Comment> {
        return await db.orm.public.Comments.create(comment);
    }

    async delete(id: number): Promise<void> {
        await db.orm.public.Comments.where({id}).delete();
    }
}