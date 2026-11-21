import { beforeEach, describe, expect, test, vi } from "vitest"
import { PostService } from "./post.service.js";
import { InMemoryPostRepository } from "@/repositories/posts.repository.js";
import type { Post, PostForCreation, PostQueryOptions } from "@/repositories/posts.repository.interface.js";
import { faker } from '@faker-js/faker';
import { ForbiddenException } from "@/exceptions/exceptions.js";

describe("Test Posts service", () => {
    const AUTHOR_ID: number = 1;
    const NON_AUTHOR_ID: number = 2;

    let postService: PostService;
    let postRepository: InMemoryPostRepository;

    let mockupPostId: number;

    beforeEach(async () => {
        postRepository = new InMemoryPostRepository();
        postService = new PostService(postRepository);
    });

    describe("create, delete, update", () => {
        beforeEach(async () => {
            mockupPostId = (await postService.create(createMockupPost(AUTHOR_ID))).id;
        })

        describe("create", () => {
            test("user can successfully create a post", async () => {
                expect((await postRepository.getById(mockupPostId))).not.toBeNull();
            })
            
            test("user can successfully create a post with a tag", async () => {
                const id = (await postService.create(createMockupPost(AUTHOR_ID, ["literature"]))).id;

                expect((await postRepository.getById(id))).not.toBeNull();
                expect((await postRepository.getById(id, {includeTags: true})).tags.length).toBe(1);
            })

            test("user can successfully create a post with multiple tags", async () => {
                const id = (await postService.create(createMockupPost(AUTHOR_ID, ["literature", "culture", "music"]))).id;

                expect((await postRepository.getById(id))).not.toBeNull();
                expect((await postRepository.getById(id, { includeTags: true })).tags.length).toBe(3);
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
            const MOCKUP_TITLE = "Alan turing is the father of computer science";

            test("owner can successfully edit a post", async () => {
                const oldPost = await getPost(mockupPostId);
                await postService.update(mockupPostId, { title: MOCKUP_TITLE }, AUTHOR_ID);
                const updatedPost = await getPost(mockupPostId);

                expect(oldPost).not.toEqual(updatedPost);

                expect(oldPost).toEqual({
                    ...updatedPost,
                    title: oldPost!.title,
                    updatedAt: oldPost!.updatedAt,
                });

                expect(updatedPost.title).toBe("Alan turing is the father of computer science");
                expect(updatedPost.updatedAt.getTime()).toBeGreaterThanOrEqual(oldPost.updatedAt.getTime());
            })

            test("non-owner cannot edit a post", async () => {
                const oldPost = await getPost(mockupPostId);
                await expect(postService.update(mockupPostId, { title: MOCKUP_TITLE }, NON_AUTHOR_ID)).rejects.toThrow(ForbiddenException);
                const updatedPost = await getPost(mockupPostId);

                expect(oldPost).toEqual(updatedPost);
            })
        });
    })

    describe("read", () => {
        describe("getMany", () => {
            beforeEach(async () => {
                const randomDate = () =>
                    new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));

                const tags: string[][] = new Array(10).fill(["news"]);
                tags[0] = ["literature"];
                tags[1] = ["culture", "literature"];
                tags[2] = ["literature"];
                tags[6] = ["literature", "culture"];
                tags[7] = ["culture"];
                tags[9] = ["culture"];

                vi.useFakeTimers();
                for (let i = 0; i < 10; i++) {
                    vi.setSystemTime(randomDate());
                    await postService.create(createMockupPost(AUTHOR_ID, tags[i]));
                }
                vi.useRealTimers();
            })

            test("reads 10 most recent posts", async () => {
                const posts = await postService.getMany({
                    orderBy: { createdAt: "desc" },
                    limit: 10,
                });

                expect(posts.length).toBe(10);
                for (let i = 0; i < posts.length - 1; i++) {
                    expect(posts[i]!.createdAt.getTime()).toBeGreaterThanOrEqual(posts[i + 1]!.createdAt.getTime());
                }
            })

            test("reads 10 oldest posts", async () => {
                const posts = await postService.getMany({
                    orderBy: { createdAt: "asc" },
                    limit: 10,
                });

                expect(posts.length).toBe(10);
                for (let i = 0; i < posts.length - 1; i++) {
                    expect(posts[i]!.createdAt.getTime()).toBeLessThanOrEqual(posts[i + 1]!.createdAt.getTime());
                }
            });

            test("reads all posts with a given tag", async () => {
                const literatureCulturePosts = await postService.getMany({tags: ["culture", "literature"]});
                expect(literatureCulturePosts.length).toBe(2);

                const culturePosts = await postService.getMany({ tags: ["culture"] });
                expect(culturePosts.length).toBe(4);
            })

            test.todo("reads all tags used by a post")
        });
    })

    const getPost = async (id: number): Promise<Post> => {
        const oldPost = await postRepository.getById(mockupPostId)
        expect(oldPost).not.toBeNull();

        return oldPost!;
    }
})

const createMockupPost = (authorId: number, tags?: string[]): PostForCreation => {
    return {
        title: faker.book.title(),
        body: faker.lorem.paragraph(3),
        authorId,
        ...(tags && { tags }),
    };
}