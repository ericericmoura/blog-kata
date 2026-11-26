import { db } from "@/prisma/db.js";
import type { Post, PostForCreation, PostForUpdate, PostQueryOptions, PostRepository, Tag } from "./posts.repository.interface.js";
import type { PostgresTransactionContext } from "@prisma/orm-postgres/runtime";
import type { Contract } from "@/prisma/contract.js";
import { and, type NoCollectionClasses } from "@prisma/orm-postgres/orm-client";

export class PrismaPostRepository implements PostRepository {
    async create(post: PostForCreation): Promise<Post> {
        const result = await db.transaction(async (tx) => {
            const tagsObject = this.serializeTags(post.tags);
            const hasTags = tagsObject.length > 0;

            if (hasTags) {
                await this.createTagsForPost(post.tags!, tx);
            }

            const newPost = await tx.orm.public.Posts.create({
                title: post.title,
                body: post.body,
                authorId: post.authorId,
                ...(hasTags && { tags: (t) => t.connect(tagsObject) }),
            })

            return newPost;
        })
        return result as Post;
    }

    async getMany(options: PostQueryOptions): Promise<Post[]> {
        const createdAtDesc = (options.orderBy?.createdAt ?? "desc") === "desc";
        const filterByTag = options.tags && options.tags.length > 0;
        const includeTags = options.include?.tags ?? false;

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

        const posts = await query.include("tags", (t) => t.select("tag")).all()

        return posts.map(({ tags, ...p }) => ({
            ...p,
            tags: tags.map(t => t.tag),
        }));
    }

    getById(id: number): Promise<Post | null> {
        throw new Error("Method not implemented.");
    }

    async delete(id: number): Promise<void> {
        await db.orm.public.Posts.where({ id }).delete();
    }

    async update(id: number, postUpdate: PostForUpdate): Promise<Post | null> {
        return db.transaction(async (tx) => {
            const tagsObject = this.serializeTags(postUpdate.tags);
            const hasTags = tagsObject.length > 0;

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
                tags: this.parseTags(updated.tags),
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

    serializeTags(tags: string[] | undefined): Tag[] {
        return (tags ?? []).map((tag) => ({ tag }));
    }

    parseTags(tags: Tag[] | undefined): string[] {
        return (tags ?? []).map((t) => t.tag);
    }
}