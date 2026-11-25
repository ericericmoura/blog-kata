import { db } from "@/prisma/db.js";
import type { Post, PostForCreation, PostForUpdate, PostQueryOptions, PostRepository } from "./posts.repository.interface.js";

export class PrismaPostRepository implements PostRepository {
    async create(post: PostForCreation): Promise<Post> {    
        const result = await db.transaction(async (tx) => {
            const tagIds: number[] = [];
            if (post.tags !== undefined) {
                for (const tag of post.tags) {
                    const existing = await db.orm.public.Tags.where({ tag }).first();
                    tagIds.push(existing === null ? (await db.orm.public.Tags.create({ tag })).id : existing.id);
                }
            }

            const newPost = await db.orm.public.Posts.create({                
                title   : post.title   ,
                body    : post.body    ,
                authorId: post.authorId,
            })

            await db.orm.public.PostTags.createAll(tagIds.map(t => ({tagId: t, postId: newPost.id})));

            return newPost;
        })
        return result as Post;
    }

    getMany(options: PostQueryOptions): Promise<Post[]> {
        throw new Error("Method not implemented.");
    }

    getById(id: number): Promise<Post | null> {
        throw new Error("Method not implemented.");
    }

    delete(id: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    update(id: number, postUpdate: PostForUpdate): Promise<Post | null> {
        throw new Error("Method not implemented.");
    }
}