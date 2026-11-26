import type { Tag, TagQueryOptions, TagsRepository } from "./tags.repository.interface";

export class PrismaTagsRepository implements TagsRepository {
    getMany(options: TagQueryOptions): Promise<Tag | null> {
        throw new Error("Method not implemented.");
    }
}