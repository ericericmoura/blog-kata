import { beforeEach, describe, expect, test } from "vitest";
import { getMockupPostForCreation } from "@/mockups/post.mockup.js";
import { PrismaPostRepository } from "./posts.repository.js";
import { PrismaUserRepository } from "../users/user.repository.js";
import { getMockupUserForCreation } from "@/mockups/user.mockup.js";
import { db } from "@/prisma/db.js";
import type { Post, PostForCreation } from "./posts.repository.interface.js";

describe("Posts Repository", () => {
    let postsRepository = new PrismaPostRepository();
    let usersRepository = new PrismaUserRepository();

    let authorId: number;

    beforeEach(async () => {
        await db.orm.public.Users   .where({}).deleteAll();
        await db.orm.public.Posts   .where({}).deleteAll();
        await db.orm.public.Tags    .where({}).deleteAll();
        await db.orm.public.PostTags.where({}).deleteAll();

        authorId = (await usersRepository.create(getMockupUserForCreation())).id;
    })
    
    test.for([
        { tags: ["literature", "culture", "horror", "action"], description: "multiple tags" },
        { tags: ["literature"], description: "a tag" },
        { tags: [], description: "no tags" },
    ])("creates a post with $description", async ({description, tags}) => {
        const { created, input } = await createPost(authorId, tags);

        const saved = await getPost(created.id, true);
        expect(saved).not.toBeNull();

        expect(saved).toMatchObject(expect.objectContaining({
            ...input,
            tags: input.tags?.map(t => ({ tag: t })) ?? []
        }));
    })

    test("deletes a post", async () => {
        const {id} = await db.orm.public.Posts.create(getMockupPostForCreation(authorId) as Omit<PostForCreation, "tags">);

        expect(id).toBeDefined();
        
        await postsRepository.delete(id);

        const found = await db.orm.public.Posts.where({id}).first();
        expect(found).toBeNull();
    });

    test("edits a post", async () => {
        const created = await db.orm.public.Posts.create(getMockupPostForCreation(authorId) as Omit<PostForCreation, "tags">);

        const updated = await postsRepository.update(created.id, {title: "My Cool Title"});
        
        expect(updated).not.toBeNull();                
        expect(created.title).not.toBe(updated!.title);
        expect(created.updatedAt.getTime()).toBeLessThan(updated!.updatedAt.getTime());
        
        expect(created).toMatchObject({
            ...updated,
            updatedAt: created.updatedAt,
            title    : created.title,
        });
    });

    test.todo("retrieves 10 most recent posts");
    test.todo("retrieves posts with a given tag");
    test.todo("list all tags used by a post");
    test.todo("correctly paginates posts");

    const createPost = async (authorId: number, tags?: string[]): Promise<{ created: Post, input: PostForCreation }> => {
        const post = getMockupPostForCreation(authorId, tags);
        return {created: (await postsRepository.create(post)), input: post};
    }

    const getPost = async (id: number, includeTags: boolean): Promise<Post | null> => {
        let query = db.orm.public.Posts.where({ id });
        if (includeTags) {
            query = query.include("tags", (t) => t.select("tag"));
        }
        return await query.first();
    }
})