import { beforeEach, describe, expect, test } from "vitest"
import { PostService } from "./post.service.js";
import { InMemoryPostRepository } from "@/repositories/posts.repository.js";

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
        await postService.create({ 
            title: "The story of Alan Turing", 
            body : "Alan Turing (1912-1954) was a British mathematician whose ideas shaped the modern world long before most people realized it. In 1936 he introduced the concept of the “Turing machine,” an abstract model of computation that laid the theoretical groundwork for every computer we use today. During World War II, he worked at Bletchley Park, where he played a central role in breaking the German Enigma cipher. His codebreaking methods and the electromechanical Bombe machine helped the Allies read encrypted communications, and historians credit this work with shortening the war and saving countless lives.",
            authorId: AUTHOR_ID,
        });
        
        expect(await postRepository.getAll().length).toBe(1);
    })

    test.todo("owner can successfully delete a post")
    test.todo("owner can Successfully edit a post")
    test.todo("non-owner cannot delete a post")
    test.todo("non-owner cannot edit a post")
})