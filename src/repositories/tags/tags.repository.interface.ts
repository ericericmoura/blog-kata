export interface Tag {
    id: number,
    tag: string,
    createdAt: Date,
    updatedAt: Date,
}

export type TagQueryOptions = {
    skip  ?: number,
    limit ?: number,
    postId?: number,
}

export interface TagsRepository {
    getMany(options: TagQueryOptions): Promise<Tag[]>;
}