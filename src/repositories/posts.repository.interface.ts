export interface Post {
    id       : number,
    title    : string,
    body     : string,    
    authorId : number,
    isActive : boolean,
    createdAt: Date,
    updatedAt: Date,
}

export type PostForCreation = Pick<Post, "title" | "body" | "authorId">;

export type PostQueryOptions = {
    skip: number,
    take: number,
}

export interface PostRepository {
    create (post   : PostForCreation ): Promise<Post>;
    getMany(options: PostQueryOptions): Promise<Post[]>;
    getById(id: number): Promise<Post | null>
    delete (id: number): Promise<void>
}