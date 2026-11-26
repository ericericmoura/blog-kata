import { db } from "@/prisma/db.js";
import type { Post, PostForCreation, PostForUpdate, PostQueryOptions, PostRepository, Tag } from "./posts.repository.interface.js";
import type { PostgresTransactionContext } from "@prisma/orm-postgres/runtime";
import type { Contract } from "@/prisma/contract.js";
import { and, type NoCollectionClasses } from "@prisma/orm-postgres/orm-client";
import { parseTags } from "@/utils/tags.utils.js";

export class PrismaPostRepository implements PostRepository {
    async create(post: PostForCreation): Promise<Post> {
        return (await this.upsertPost(post)) as Post;
    }

    async getMany(options: PostQueryOptions): Promise<Post[]> {
        const createdAtDesc = (options.orderBy?.createdAt ?? "desc") === "desc";
        const filterByTag   = options.tags && options.tags.length > 0;
        const includeTags   = options.include?.tags ?? false;

        let query = db.orm.public.Posts
            .where((p) => (
                filterByTag ? and(...options.tags!.map(name => p.tags.some(t => t.tag.eq(name))))
                            : p.id.isNotNull()
            ))
            .limit(options.limit ?? 10)
            .offset(options.skip ?? 0)
            .orderBy([
                (p) => (createdAtDesc ? p.createdAt.desc() : p.createdAt.asc()),
                (p) => (createdAtDesc ? p.id.desc() : p.id.asc()),
            ])

        if (!includeTags) return await query.all();

        return await query.include("tags", (t) => t.select("tag")).all();
    }

    getById(id: number): Promise<Post | null> {
        throw new Error("Method not implemented.");
    }

    async delete(id: number): Promise<void> {
        await db.orm.public.Posts.where({ id }).delete();
    }

    async update(id: number, postUpdate: PostForUpdate): Promise<Post | null> {
        return await this.upsertPost(postUpdate, id);
    }

    async createTagsForPost(tags: Tag[], tx: PostgresTransactionContext<Contract, NoCollectionClasses>) {
        await tx.orm.public.Tags.createAndCount(tags,
            {
                onConflict: "skip",
                conflictOn: ["tag"],
            });
    }    

    async upsertPost(input: PostForCreation | PostForUpdate, id?: number): Promise<Post | null> {
        const isUpdating = id !== undefined;

        return db.transaction(async (tx) => {
            const hasTags = input.tags !== undefined && input.tags.length > 0;

            if (hasTags) {
                if (isUpdating) {
                    await tx.orm.public.PostTags
                        .where({ postId: id })
                        .where(pt => pt.tag.some(t => t.tag.notIn(parseTags(input.tags!))))
                        .deleteAll();
                }

                await this.createTagsForPost(input.tags!, tx);
            }           
            
            let post: Post | null = null;

            if (isUpdating) {
                post = await tx.orm.public.Posts.where({ id }).include("tags", t => t.select("tag")).update({
                    ...input as Omit<PostForUpdate, "tags">,
                    ...(hasTags && { tags: (t) => t.connect(input.tags!) }),
                    updatedAt: new Date(),
                });
            } else {
                post = await tx.orm.public.Posts.create({
                    title   : input.title   !,
                    body    : input.body    !,
                    authorId: input.authorId!,
                    ...(hasTags && { tags: (t) => t.connect(input.tags!) }),
                })               
            }

            return post;
        })
    }
}