import { beforeEach, describe, expect, test } from "vitest";
import { PrismaUserRepository } from "../users/user.repository";
import { PrismaPostRepository } from "../posts/posts.repository";
import { clearDb } from "@/utils/database.utils";
import { getMockupUserForCreation } from "@/mockups/user.mockup";
import { PrismaCommentsRepository } from "./comments.repository";
import { getMockupPostForCreation } from "@/mockups/post.mockup";
import type { Post, PostForCreation } from "../posts/posts.repository.interface";
import { db } from "@/prisma/db";

describe("Comments Repository", () => {
    const commentsRepository = new PrismaCommentsRepository();
    const usersRepository    = new PrismaUserRepository();

    let authorId: number;

    beforeEach(async () => {
        await clearDb();

        authorId = (await usersRepository.create(getMockupUserForCreation())).id;
    })

    test("creates a comment for a post", async () => {
        const { id: postId } = await createMockupPost();

        await commentsRepository.create({ postId, userId: authorId, body: "Meu comentário legal"});
        const saved = await db.orm.public.Comments.where({ postId }).select("body").first();
        expect(saved).not.toBeNull();
    });

    test("creates many comments for a post", async () => {
        const { id: postId } = await createMockupPost();

        const comments = ["Comentário 1", "Comentário 2", "That's really cool!"];
        await commentsRepository.createMany({ userId: authorId, postId, comments });

        const saved = await db.orm.public.Comments.where({postId}).select("body").all();

        expect(comments).toEqual(saved.map(c => c.body));
    });

    test("deletes a comment by id", async () => {
        const { id: postId } = await createMockupPost();

        const { id } = await commentsRepository.create({ postId, userId: authorId, body: "Meu comentário legal" });
        expect(id).toBeDefined();
        await commentsRepository.delete(id);        
        
        const saved = await db.orm.public.Comments.where({ postId }).select("body").first();
        expect(saved).toBeNull();
    });

    describe("comments listing", () => {
        let postId: number;

        beforeEach(async () => {
            const comments = [
                "Can't wait for the open beta next month!",
                "The gunplay in that trailer looks super crisp.",
                "Finally, a tactical shooter without bloated hero abilities.",
                "Will there be crossplay on day one?",
                "Already wishlisted! Drop the system requirements soon.",
                "Movement mechanics remind me of classic arena shooters.",
                "Hope the anti-cheat is strong at launch.",
                "Those weapon sound effects are next level.",
                "Sign me up for the closed playtest!",
                "Looks promising, just please avoid pay-to-win microtransactions."
            ];
            
            postId = (await createMockupPost()).id;

            const input = comments.map(c => ({
                userId: authorId,
                postId,
                body: c
            }));            
            await db.orm.public.Comments.createAll(input);
        })
        
        test("list 10 most recent comments for a post", async () => {
            const comments = await commentsRepository.getMany({postId, limit: 10});

            expect(comments).toBeDefined();
            expect(comments.length).toBe(10);
            for (let i = 0; i < comments.length - 1; i++) {
                const frameStart = i;
                const frameEnd   = i+1;
                
                const firstComment  = comments.at(frameStart)!;
                const secondComment = comments.at(frameEnd  )!;

                expect(firstComment.createdAt.getTime()).toBeGreaterThan(secondComment.createdAt.getTime());
            }
        });    

        test.todo("list 10 most recent comments from a user");
        test.todo("list 10 most recent comments from a user on a post");    
    });


    const createMockupPost = async (): Promise<Post> => {
        return await db.orm.public.Posts.create(getMockupPostForCreation(authorId) as Omit<PostForCreation, "tags">);
    }
})
