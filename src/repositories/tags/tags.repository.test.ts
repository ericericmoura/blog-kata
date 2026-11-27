import { db } from "@/prisma/db";
import { beforeEach, describe, expect, test } from "vitest";
import { PrismaPostRepository } from "../posts/posts.repository";
import { getMockupPostForCreation } from "@/mockups/post.mockup";
import { getMockupUserForCreation } from "@/mockups/user.mockup";
import { PrismaUserRepository } from "../users/user.repository";
import { parseTags } from "@/utils/tags.utils";
import { clearDb } from "@/utils/database.utils";
import { PrismaTagsRepository } from "./tags.repository";

describe("Tags Repository", () => {
    let tagsRepository  = new PrismaTagsRepository();
    let postsRepository = new PrismaPostRepository();
    let usersRepository = new PrismaUserRepository();    

    let authorId: number;

    beforeEach(async () => {
        await clearDb();

        authorId = (await usersRepository.create(getMockupUserForCreation())).id;
    })

    test("lists all tags used by a post", async () => {        
        const created = await postsRepository.create(getMockupPostForCreation(authorId, ["literature", "culture"]));

        const tags = await tagsRepository.getMany({ postId: created.id });

        expect(tags.length).toBe(2);
        expect(parseTags(tags)).toEqual(["literature", "culture"]);
    });
})