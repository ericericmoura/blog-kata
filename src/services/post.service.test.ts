import { beforeEach, describe, expect, test } from "vitest"
import { PostService } from "./post.service.js";
import { InMemoryPostRepository } from "@/repositories/posts.repository.js";
import type { PostForCreation } from "@/repositories/posts.repository.interface.js";
import { faker } from '@faker-js/faker';
import { ForbiddenException } from "@/exceptions/exceptions.js";

describe("Test Posts service", () => {
    const AUTHOR_ID    : number = 1;
    const NON_AUTHOR_ID: number = 2;

    let postService   : PostService;
    let postRepository: InMemoryPostRepository;

    beforeEach(() => {
        postRepository = new InMemoryPostRepository();
        postService    = new PostService(postRepository);
    });

    describe("create", () => {
        test("user can successfully create a post", async () => {
            const {id} = await postService.create(createMockupPost(AUTHOR_ID));
            expect((await postRepository.getById(id))).not.toBeNull();
        })
    })

    describe("delete", () => {
        test("owner can successfully delete a post", async () => {
            const {id} = await postService.create(createMockupPost(AUTHOR_ID));
            await postService.delete(id, AUTHOR_ID);
            expect((await postRepository.getById(id))).toBeNull();
        })

        test("non-owner cannot delete a post", async () => {
            const { id } = await postService.create(createMockupPost(AUTHOR_ID));
            await expect(postService.delete(id, NON_AUTHOR_ID)).rejects.toThrow(ForbiddenException);
            expect((await postRepository.getById(id))).not.toBeNull();
        })
    });

    describe("update", () => {
        test.todo("owner can successfully edit a post")
        test.todo("non-owner cannot edit a post")
    });

    describe("getMany", () => {
        test.todo("can get 10 most recent posts")
        test.todo("can get posts with a given tag")
        test.todo("can get all tags used by a post")
    });
})

const createMockupPost = (authorId: number): PostForCreation => {
    return {
        title: faker.book.title(),
        body : faker.lorem.paragraph(3),
        authorId,
    };
}