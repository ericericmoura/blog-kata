import { beforeEach, describe, expect, test, vi, type Mocked } from "vitest"
import { PostService } from "./posts.service.js";
import type { Post, PostRepository } from "@/repositories/posts.repository.interface.js";
import { faker } from '@faker-js/faker';
import { ForbiddenException } from "@/exceptions/exceptions.js";

describe("Test Posts service", () => {
    const AUTHOR_ID: number = 1;
    const NON_AUTHOR_ID: number = 2;

    let postService: PostService;
    let postRepository: Mocked<PostRepository>;

    let mockupPostId: number;

    beforeEach(async () => {
        postRepository = {
            getMany: vi.fn(),
            create : vi.fn(),
            delete : vi.fn(),
            getById: vi.fn(),
            update : vi.fn(),
        };
        postService = new PostService(postRepository);
    });

    describe("delete, update", () => {
        beforeEach(async () => {
            postRepository.getById.mockResolvedValueOnce(createMockupPost(AUTHOR_ID, 1));
            mockupPostId = 1;
        })

        describe("delete", () => {
            test("owner can successfully delete a post", async () => {
                await postService.delete(mockupPostId, AUTHOR_ID);
                expect(postRepository.delete).toHaveBeenCalledWith(mockupPostId);                
            })

            test("non-owner cannot delete a post", async () => {
                await expect(postService.delete(mockupPostId, NON_AUTHOR_ID)).rejects.toThrow(ForbiddenException);
                expect(postRepository.delete).not.toHaveBeenCalled();
            })
        });

        describe("update", () => {
            const MOCKUP_TITLE = "Alan turing is the father of computer science";

            test("owner can successfully edit a post", async () => {                
                await postService.update(mockupPostId, { title: MOCKUP_TITLE }, AUTHOR_ID);

                expect(postRepository.update).toHaveBeenCalledWith(mockupPostId, expect.objectContaining({ title: MOCKUP_TITLE }));
            })

            test("non-owner cannot edit a post", async () => {
                await expect(postService.update(mockupPostId, { title: MOCKUP_TITLE }, NON_AUTHOR_ID)).rejects.toThrow(ForbiddenException);

                expect(postRepository.update).not.toHaveBeenCalled();
            })
        });
    })
})

const createMockupPost = (authorId: number, id: number, tags?: string[]): Post => {
    return {
        id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        title: faker.book.title(),
        body: faker.lorem.paragraph(3),
        authorId,
        ...(tags && { tags }),
    };
}