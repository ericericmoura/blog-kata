import { db } from "@/prisma/db.js";
import type { Post, PostForCreation, PostForUpdate, PostQueryOptions, PostRepository } from "./posts.repository.interface.js";

export class PrismaPostRepository implements PostRepository {
    async create(post: PostForCreation): Promise<Post> {    
        const result = await db.transaction(async (tx) => {            
            const tagsObject = (post.tags ?? []).map((tag) => ({ tag }));
            const hasTags = tagsObject.length > 0;

            if (post.tags !== undefined && hasTags) {
                await tx.orm.public.Tags.createAndCount(tagsObject,
                    {
                        onConflict: "skip" ,
                        conflictOn: ["tag"],
                });
            }

            const newPost = await tx.orm.public.Posts.create({                
                title   : post.title   ,
                body    : post.body    ,
                authorId: post.authorId,
                ...(hasTags && {tags: (t) => t.connect(tagsObject)}),
            })

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

    async delete(id: number): Promise<void> {
        await db.orm.public.Posts.where({id}).delete();
    }
    
    async update(id: number, postUpdate: PostForUpdate): Promise<Post | null> {
        throw new Error("Method not implemented.");
    }
}