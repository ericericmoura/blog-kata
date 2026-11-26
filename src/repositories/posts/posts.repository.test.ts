import { beforeEach, describe, expect, test } from "vitest";
import { getMockupPostForCreation } from "@/mockups/post.mockup.js";
import { PrismaPostRepository } from "./posts.repository.js";
import { PrismaUserRepository } from "../users/user.repository.js";
import { getMockupUserForCreation } from "@/mockups/user.mockup.js";
import { db } from "@/prisma/db.js";
import type { Post, PostForCreation } from "./posts.repository.interface.js";
import { parseTags, serializeTags } from "@/utils/tags.utils.js";
import { clearDb } from "@/utils/database.utils.js";

describe("Posts Repository", () => {
    let postsRepository = new PrismaPostRepository();
    let usersRepository = new PrismaUserRepository();    

    let authorId: number;

    beforeEach(async () => {
        await clearDb();

        authorId = (await usersRepository.create(getMockupUserForCreation())).id;
    })
    
    test.for([
        { tags: ["literature", "culture", "horror", "action"], description: "multiple tags" },
        { tags: ["literature"], description: "a tag" },
        { tags: [], description: "no tags" },
    ])("creates a post with $description", async ({description, tags}) => {
        const { created, input } = await createPost(authorId, tags);

        const saved = await getPost(created.id, true);
        expect(saved).not.toBeNull();

        expect(saved).toMatchObject(expect.objectContaining({
            ...input,
            tags: input.tags
        }));
    })

    test("deletes a post", async () => {
        const {id} = await db.orm.public.Posts.create(getMockupPostForCreation(authorId) as Omit<PostForCreation, "tags">);

        expect(id).toBeDefined();
        
        await postsRepository.delete(id);

        const found = await db.orm.public.Posts.where({id}).first();
        expect(found).toBeNull();
    });

    test("edits a post", async () => {
        const created = await db.orm.public.Posts
            .create(getMockupPostForCreation(authorId) as Omit<PostForCreation, "tags">);

        const updated = await postsRepository.update(created.id, {title: "My Cool Title"});
        
        expect(updated).not.toBeNull();                
        expect(created.title).not.toBe(updated!.title);
        expect(created.updatedAt.getTime()).toBeLessThan(updated!.updatedAt.getTime());

        console.log(created);
        
        expect({
            ...updated,
            updatedAt: created.updatedAt,
            title: created.title,
        }).toMatchObject(created);
    });

    test("edits a post tags", async () => {
        const { created } = await createPost(authorId, ["literature", "culture"]);

        const updated = await postsRepository.update(created.id, { tags: serializeTags(["literature", "poetry"]) });

        expect(updated).not.toBeNull();
        expect(updated!.tags).toBeDefined();

        expect(created.tags).not.toEqual(updated!.tags);
        expect(updated!.tags).toEqual(serializeTags(["literature", "poetry"]));
        expect(created.updatedAt.getTime()).toBeLessThan(updated!.updatedAt.getTime());

        expect({
            ...updated,
            updatedAt: created.updatedAt,
            tags: created.tags,
        }).toMatchObject(created);
    });

    test("retrieves 10 most recent posts", async () => {        
        await createManyPosts(authorId, 10);

        const posts = await postsRepository.getMany({skip: 0, limit: 10, orderBy: {createdAt: "desc"}});

        expect(posts.length).toBe(10);

        let frameStart = 0;
        let frameEnd   = 1;
        for (let i = 0; i < posts.length - 1; i++) {
            const current = posts.at(frameStart);
            const next    = posts.at(frameEnd);
            expect(current).toBeDefined();
            expect(next   ).toBeDefined();

            expect(current!.createdAt.getTime()).toBeGreaterThan(next!.createdAt.getTime());            

            frameStart++;
            frameEnd  ++;
        }
    });

    test("retrieves posts with a given tag", async () => {
        await createManyPostsWithTags(
            authorId, [
                { qnt: 3, tags: ["sport" ] }, 
                { qnt: 6, tags: ["health"] }, 
                { qnt: 1, tags: ["literature", "sport"] }
            ]);

        const sportPosts = await postsRepository.getMany({tags: ["sport"], include: { tags: true }});
        expect(sportPosts.length).toBe(4);
        expect(sportPosts.at(0)!.tags).toBeDefined();
        expect(sportPosts.every(p => parseTags(p.tags!).some(t => t === "sport"))).toBe(true);

        const literatureSportPosts = await postsRepository
            .getMany({ 
                tags: ["sport", "literature"], 
                include: { tags: true },
            });
        expect(literatureSportPosts.length).toBe(1); 
        expect(literatureSportPosts.at(0)!.tags).toBeDefined();

        const parsedTags = parseTags(literatureSportPosts.at(0)!.tags!);
        expect(parsedTags.find(t => t === "sport"     )).toBeDefined();
        expect(parsedTags.find(t => t === "literature")).toBeDefined();
    });
    
    test.todo("correctly paginates posts");

    const createPost = async (authorId: number, tags?: string[]): Promise<{ created: Post, input: PostForCreation }> => {
        const post = getMockupPostForCreation(authorId, tags);
        return {created: (await postsRepository.create(post)), input: post};
    }

    const createManyPosts = async (authorId: number, quantity: number, tags?: string[]): Promise<void> => {
        for (let i = 0; i < quantity; i++) {
            await createPost(authorId, tags);
        }
    }

    const createManyPostsWithTags = async (authorId: number, posts: {qnt: number, tags: string[]}[]): Promise<void> => {
        for (const post of posts) {
            await createManyPosts(authorId, post.qnt, post.tags);
        }
    }

    const getPost = async (id: number, includeTags: boolean): Promise<Post | null> => {
        let query = db.orm.public.Posts.where({ id });
        if (includeTags) {
            query = query.include("tags", (t) => t.select("tag"));
        }
        return await query.first();
    }
})