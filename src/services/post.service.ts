import type { Post, PostForCreation, PostRepository } from "@/repositories/posts.repository.interface.js";

export class PostService {
    private postRepository: PostRepository;

    constructor(postRepository: PostRepository) {
        this.postRepository = postRepository;
    }

    async create(post: PostForCreation): Promise<Post> {
        return await this.postRepository.create(post);  
    }

    async delete(id: number, authorId: number): Promise<void> {
        const post = await this.postRepository.getById(id);
        if (post?.authorId !== authorId) return;
        await this.postRepository.delete(id);
    }
}