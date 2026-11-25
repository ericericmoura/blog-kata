import type { SortOption } from "@/types/querying.types.js";

export interface Post {
    id       : number,
    title    : string,
    body     : string,    
    authorId : number,
    isActive : boolean,
    createdAt: Date,
    updatedAt: Date,
    tags?    : string[],
}

type BasePostInfo = "title" | "body" | "authorId";

export type PostForCreation = Pick<Post, BasePostInfo | "tags">;
export type PostForUpdate   = Partial<Pick<Post, BasePostInfo | "isActive">>;

export type PostOrderingOptions = {
    createdAt: SortOption,
}

export type PostQueryOptions = {
    skip   ?: number,
    limit  ?: number,
    orderBy?: PostOrderingOptions,
    tags   ?: string[],
}

export interface PostRepository {
    create (post   : PostForCreation ): Promise<Post>;
    getMany(options: PostQueryOptions): Promise<Post[]>;
    getById(id: number): Promise<Post | null>
    delete (id: number): Promise<void>
    update (id: number, postUpdate: PostForUpdate) : Promise<Post | null>
}