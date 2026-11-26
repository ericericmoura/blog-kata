export interface Comment {
    id: number,
    body: string,
    createdAt: Date,
    updatedAt: Date,
}

export type CommentForCreation = Pick<Comment, "body">;

export type CommentsQueryOptions = {
    limit ?: number,
    skip  ?: number,
    postId?: number,
    userId?: number,
}

export interface CommentsRepository {
    getMany(options: CommentsQueryOptions): Promise<Comment[]>;    
    create (user   : CommentForCreation  ): Promise<Comment>;
    delete (id: number): Promise<void>;
}