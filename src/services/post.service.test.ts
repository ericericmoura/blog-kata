import { assert, beforeEach, describe, expect, test } from "vitest"
import { PostService } from "./post.service.js";
import { InMemoryPostRepository } from "@/repositories/posts.repository.js";
import type { PostForCreation } from "@/repositories/posts.repository.interface.js";
import { faker } from '@faker-js/faker';

describe("Test Posts service", () => {
    const AUTHOR_ID    : number = 1;
    const NON_AUTHOR_ID: number = 2;

    let postService   : PostService;
    let postRepository: InMemoryPostRepository;

    beforeEach(() => {
        postRepository = new InMemoryPostRepository();
        postService    = new PostService(postRepository);
    });

    test("user can successfully create a post", async () => {
        const {id} = await postService.create(createMockupPost(AUTHOR_ID));
        expect((await postRepository.getById(id))).not.toBeNull();
    })

    test("owner can successfully delete a post", async () => {
        const {id} = await postService.create(createMockupPost(AUTHOR_ID));
        await postService.delete(id, AUTHOR_ID);
        expect((await postRepository.getById(id))).toBeNull();
    })

    test("non-owner cannot delete a post", async () => {
        const { id } = await postService.create(createMockupPost(AUTHOR_ID));
        expect(postService.delete(id, NON_AUTHOR_ID)).rejects.toThrow(UnauthorizedException);
        expect((await postRepository.getById(id))).not.toBeNull();
    })

    test.todo("non-owner cannot edit a post")
})

const createMockupPost = (authorId: number): PostForCreation => {
    return {
        title: faker.book.title(),
        body : faker.lorem.paragraph(3),
        authorId,
    };
}