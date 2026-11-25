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

    test("creates a post with a tag", async () => {
        const { created, input } = await createPost(authorId, ["literature", "culture", "horror", "action"]);

        const saved = await getPost(created.id, true);
        expect(saved).not.toBeNull();

        expect(saved).toMatchObject(expect.objectContaining({
            ...input,
            tags: input.tags?.map(t => ({ tag: t }))
        }));        
    });

    test("creates a post with multiple tags", async () => {
        const { created, input } = await createPost(authorId, ["literature", "culture", "horror", "action"]);

        const saved = await getPost(created.id, true);
        expect(saved).not.toBeNull();

        expect(saved).toMatchObject(expect.objectContaining({
            ...input,
            tags: input.tags?.map(t => ({ tag: t }))
        }));
    });

    test.todo("deletes a post");
    test.todo("edits a post");
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