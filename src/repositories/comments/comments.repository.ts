import { db } from "@/prisma/db";
import type { Comment, CommentForCreation, CommentsQueryOptions, CommentsRepository } from "./comments.repository.interface";

export class PrismaCommentsRepository implements CommentsRepository {
    getMany(options: CommentsQueryOptions): Promise<Comment[]> {
        throw new Error("Method not implemented.");
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