import { beforeEach, describe, expect, test } from "vitest"
import { PostService } from "./post.service.js";
import { InMemoryPostRepository } from "@/repositories/posts.repository.js";
import type { Post, PostForCreation } from "@/repositories/posts.repository.interface.js";
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
    });

    describe("create, delete, update", () => {
        beforeEach(async () => {
            mockupPostId = (await postService.create(createMockupPost(AUTHOR_ID))).id;
        })

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
            const MOCKUP_TITLE = "Alan turing is the father of computer science";
    
            test("owner can successfully edit a post", async () => {
                const oldPost     = await getPost(mockupPostId);
                await postService.update(mockupPostId, { title: MOCKUP_TITLE }, AUTHOR_ID);
                const updatedPost = await getPost(mockupPostId);   
    
                expect(oldPost).not.toEqual(updatedPost);
    
                expect(oldPost).toEqual({
                    ...updatedPost,
                    title    : oldPost!.title,
                    updatedAt: oldPost!.updatedAt,
                });
                
                expect(updatedPost.title).toBe("Alan turing is the father of computer science");
                expect(updatedPost.updatedAt.getTime()).toBeGreaterThanOrEqual(oldPost.updatedAt.getTime());
            })
    
            test("non-owner cannot edit a post", async () => {
                const oldPost     = await getPost(mockupPostId);
                await expect(postService.update(mockupPostId, { title: MOCKUP_TITLE }, NON_AUTHOR_ID)).rejects.toThrow(ForbiddenException);            
                const updatedPost = await getPost(mockupPostId);            
    
                expect(oldPost).toEqual(updatedPost);
            })        
        });
    })

    describe("read", () => {
        describe("getMany", () => {
            beforeEach(async () => {
                Promise.all([
                    Array.from({ length: 10 }, () => { postService.create(createMockupPost(AUTHOR_ID)); })
                ])
            })
    
            test("reads 10 most recent posts", async () => {
                const posts = await postService.getMany({
                    orderBy: { date: "desc" },
                    limit  : 10,
                });

                expect(posts.length).toBe(10);
                for (let i = 0; i < posts.length - 1; i++) {
                    expect(posts[i]!.createdAt.getTime()).toBeGreaterThan(posts[i+1]!.createdAt.getTime());
                }
            })
    
            test.todo("reads 10 oldest posts")
            test.todo("reads all posts with a given tag")
            test.todo("reads all tags used by a post")
        });
    })
    
    const getPost = async (id: number): Promise<Post> => {
        const oldPost = await postRepository.getById(mockupPostId)
        expect(oldPost).not.toBeNull();

        return oldPost!;
    }
})

const createMockupPost = (authorId: number): PostForCreation => {
    return {
        title: faker.book.title(),
        body : faker.lorem.paragraph(3),
        authorId,
    };
}