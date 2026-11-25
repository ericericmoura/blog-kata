import { db } from "@/prisma/db.js";
import type { Post, PostForCreation, PostForUpdate, PostQueryOptions, PostRepository } from "./posts.repository.interface.js";
import type { PostgresTransactionContext } from "@prisma/orm-postgres/runtime";
import type { Contract } from "@/prisma/contract.js";
import type { NoCollectionClasses } from "@prisma/orm-postgres/orm-client";

export class PrismaPostRepository implements PostRepository {
    async create(post: PostForCreation): Promise<Post> {    
        const result = await db.transaction(async (tx) => {            
            const tagsObject = this.parseTags(post.tags);
            const hasTags = tagsObject.length > 0;

            if (hasTags) {
                await this.createTagsForPost(post.tags!, tx);
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

    async getMany(options: PostQueryOptions): Promise<Post[]> {
        const createdAtDesc = (options.orderBy?.createdAt ?? "desc") === "desc";

        let result = await db.orm.public.Posts
            .limit (options.limit ?? 10)
            .offset(options.skip  ?? 0 )
            .orderBy([
                (p) => (createdAtDesc ? p.createdAt.desc() : p.createdAt.asc()),
                (p) => (createdAtDesc ? p.id.desc()        : p.id.asc()       ),
            ])
            .all();
        
        return result;
    }

    getById(id: number): Promise<Post | null> {
        throw new Error("Method not implemented.");
    }

    async delete(id: number): Promise<void> {
        await db.orm.public.Posts.where({id}).delete();
    }
    
    async update(id: number, postUpdate: PostForUpdate): Promise<Post | null> {
        return db.transaction(async (tx) => {            
            const tagsObject = this.parseTags(postUpdate.tags);
            const hasTags    = tagsObject.length > 0;

            if (hasTags) {
                await db.orm.public.PostTags
                    .where({ postId: id })
                    .where(pt => pt.tag.some(t => t.tag.notIn(postUpdate.tags!)))
                    .deleteAll();
                
                await this.createTagsForPost(postUpdate.tags!, tx);
            }

            const updated = await tx.orm.public.Posts.where({ id }).include("tags", t => t.select("tag")).update({
                ...postUpdate as Omit<PostForUpdate, "tags">,
                ...(hasTags && { tags: (t) => t.connect(tagsObject) }),
                updatedAt: new Date(),
            });

            if (updated === null) return null;

            return {
                ...updated,
                tags: updated.tags.map(t => t.tag),
            };
        })
    }

    async createTagsForPost(tags: string[], tx: PostgresTransactionContext<Contract, NoCollectionClasses>) {
        const tagsObject = tags.map((tag) => ({ tag }));
        
        await tx.orm.public.Tags.createAndCount(tagsObject,
            {
                onConflict: "skip",
                conflictOn: ["tag"],
            });            
    }

    parseTags(tags: string[] | undefined): { tag: string }[] {
        return (tags ?? []).map((tag) => ({ tag }));
    }    
}