import type { Comment, CommentForCreation, CommentsQueryOptions, CommentsRepository } from "./comments.repository.interface";

export class PrismaCommentsRepository implements CommentsRepository {
    getMany(options: CommentsQueryOptions): Promise<Comment[]> {
        throw new Error("Method not implemented.");
    }
    createMany(input: { postId: number; comments: string[]; }): Promise<Comment[]> {
        throw new Error("Method not implemented.");
    }
    create(comment: CommentForCreation): Promise<Comment> {
        throw new Error("Method not implemented.");
    }
    delete(id: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
}