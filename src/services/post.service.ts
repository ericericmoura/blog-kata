import type { Post, PostForCreation, PostRepository } from "@/repositories/posts.repository.interface.js";

export class PostService {
    private postRepository: PostRepository;

    constructor(postRepository: PostRepository) {
        this.postRepository = postRepository;
    }

    async create(post: PostForCreation): Promise<Post> {
        return await this.postRepository.create(post);  
    }

    async delete(id: number): Promise<void> {
        await this.postRepository.delete(id);
    }
}