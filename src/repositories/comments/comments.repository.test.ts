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

    test.todo("list 10 most recent comments from a post");
    test.todo("list 10 most recent comments from a user");
    test.todo("list 10 most recent comments from a user on a post");    

    const createMockupPost = async (): Promise<Post> => {
        return await db.orm.public.Posts.create(getMockupPostForCreation(authorId) as Omit<PostForCreation, "tags">);
    }
})
