import type { Post, PostForCreation } from "@/repositories/posts/posts.repository.interface.js";
import { serializeTags } from "@/utils/tags.utils";
import { faker } from "@faker-js/faker";

export const AUTHOR_ID    : number = 1;
export const NON_AUTHOR_ID: number = 2;

export const getMockupPostForCreation = (authorId: number, tags?: string[]): PostForCreation => {
    return {
        title: faker.book.title(),
        body : faker.lorem.paragraph(3),
        authorId,
        ...(tags && { tags: serializeTags(tags) }),
    };
}

export const getMockupPost = (authorId: number, id: number, tags?: string[]): Post => {
    return {
        id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...getMockupPostForCreation(authorId, tags),
    };
}