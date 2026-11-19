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

    let mockupPostId: number;

    beforeEach(async () => {
        postRepository = new InMemoryPostRepository();
        postService    = new PostService(postRepository);

        mockupPostId   = (await postService.create(createMockupPost(AUTHOR_ID))).id;
    });
    
    describe("create", () => {
        test("user can successfully create a post", async () => {            
            expect((await postRepository.getById(mockupPostId))).not.toBeNull();
        })
    })

    describe("delete", () => {
        test("owner can successfully delete a post", async () => {
            await postService.delete(mockupPostId, AUTHOR_ID);
            expect((await postRepository.getById(mockupPostId))).toBeNull();
        })

        test("non-owner cannot delete a post", async () => {
            await expect(postService.delete(mockupPostId, NON_AUTHOR_ID)).rejects.toThrow(ForbiddenException);
            expect((await postRepository.getById(mockupPostId))).not.toBeNull();
        })
    });

    describe("update", () => {
        test("owner can successfully edit a post", async () => {
            const oldPost = await postRepository.getById(mockupPostId);
            expect(oldPost).not.toBeNull();

            const newTitle = "Alan turing is the father of computer science";
            await postService.update(mockupPostId, {title: newTitle}, AUTHOR_ID);

            const newPost = await postRepository.getById(mockupPostId);
            expect(newPost).not.toBeNull();

            // garantee correct fields change
            expect(oldPost).not.toEqual(newPost);
            expect(oldPost!.updatedAt).not.toEqual(newPost!.updatedAt);

            // All other fields should remain unchanged
            expect(oldPost).toEqual({
                ...newPost,
                title    : oldPost!.title,
                updatedAt: oldPost!.updatedAt,
            });
            
            expect(newPost!.title).toBe("Alan turing is the father of computer science");
            expect(newPost!.updatedAt.getTime()).toBeGreaterThan(oldPost!.updatedAt.getTime());            
        })

        test.todo("non-owner cannot edit a post")
    });

    describe("getMany", () => {
        test.todo("can get 10 most recent posts")
        test.todo("can get 10 oldest posts")
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