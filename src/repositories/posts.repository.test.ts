import { faker } from "@faker-js/faker";
import { beforeEach, describe, expect, test } from "vitest";
import { AUTHOR_ID, getMockupPostForCreation } from "@/mockups/post.mockup.js";
import { PrismaPostRepository } from "./posts.repository.js";

describe("Posts Repository", () => {
    let postsRepository: PrismaPostRepository;
    let usersRepository: PrismaUserRepository;

    beforeEach(async () => {
        postsRepository = new PrismaPostRepository();
        await usersRepository.create(getMockupUserForCreation(AUTHOR_ID));
    })

    test("creates a post with a tag", async () => {
        const post = getMockupPostForCreation(AUTHOR_ID, ["literature"]);
        const {id} = await postsRepository.create(post);

        const saved = await postsRepository.getById(id, { includes: { tags: true } });
        expect(saved).not.toBeNull();
        expect(saved).toMatchObject(post);
    });

    test.todo("creates a post with multiple tags");
    test.todo("deletes a post");
    test.todo("edits a post");
    test.todo("retrieves 10 most recent posts");
    test.todo("retrieves posts with a given tag");
    test.todo("list all tags used by a post");
    test.todo("correctly paginates posts");
})