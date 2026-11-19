import type { Post, PostForCreation, PostRepository } from "@/repositories/posts.repository.interface.js"

export class PostRepositoryInMemory implements PostRepository {
    private posts: Post[] = [];

    private currentId: number = 1;

    create(post: PostForCreation): Post {
        const createdPost = {
            ...post,
            id       : this.currentId,
            isActive : true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.posts.push(createdPost);
        return createdPost;
    }
}