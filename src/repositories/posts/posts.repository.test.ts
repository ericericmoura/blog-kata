import { beforeEach, describe, expect, test } from "vitest";
import { getMockupPostForCreation } from "@/mockups/post.mockup.js";
import { PrismaPostRepository } from "./posts.repository.js";
import { PrismaUserRepository } from "../users/user.repository.js";
import { getMockupUserForCreation } from "@/mockups/user.mockup.js";
import { db } from "@/prisma/db.js";

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
        const post = getMockupPostForCreation(authorId, ["literature"]);
        const { id } = await postsRepository.create(post);

        const saved = await db.orm.public.Posts.where({ id }).include("tags", (t) => t.select("tag")).first();
        expect(saved).not.toBeNull();

        expect(saved).toMatchObject(expect.objectContaining({
            ...post,
            tags: post.tags?.map(t => ({ tag: t }))
        }));        
    });

    test.todo("creates a post with multiple tags");
    test.todo("deletes a post");
    test.todo("edits a post");
    test.todo("retrieves 10 most recent posts");
    test.todo("retrieves posts with a given tag");
    test.todo("list all tags used by a post");
    test.todo("correctly paginates posts");
})