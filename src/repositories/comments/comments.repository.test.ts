import { beforeEach, describe, test } from "vitest";
import { PrismaUserRepository } from "../users/user.repository";
import { PrismaPostRepository } from "../posts/posts.repository";
import { clearDb } from "@/utils/database.utils";
import { getMockupUserForCreation } from "@/mockups/user.mockup";

describe("Comments Repository", () => {
    const commentsRepository = new PrismaCommentsRepository();
    const postsRepository    = new PrismaPostRepository();
    const usersRepository    = new PrismaUserRepository();

    let authorId: number;

    beforeEach(async () => {
        await clearDb();

        authorId = (await usersRepository.create(getMockupUserForCreation())).id;
    })

    test.todo("comments on a post");
    test.todo("deletes all comments");
    test.todo("list 10 most recent comments from a post");
    test.todo("list 10 most recent comments from a user");
    test.todo("list 10 most recent comments from a user on a post");
})