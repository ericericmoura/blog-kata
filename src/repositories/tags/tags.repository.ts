import { db } from "@/prisma/db";
import type { Tag, TagQueryOptions, TagsRepository } from "./tags.repository.interface";

export class PrismaTagsRepository implements TagsRepository {
    async getMany(options: TagQueryOptions): Promise<Tag[] | null> {
        let query = db.orm.public.Tags
            .offset(options.skip  ?? 0 )
            .limit (options.limit ?? 20);            
        if (options.postId) {
            query = query.where(t => t.posts.some(p => p.id.eq(options.postId!)));
        }
        return await query.all();
    }
}