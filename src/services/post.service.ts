import type { Post, PostForCreation, PostRepository } from "@/repositories/posts.repository.interface.js";

export type PostDTO = Omit<Post, "id">

export class PostService {
    private postRepository: PostRepository;

    constructor(postRepository: PostRepository) {
        this.postRepository = postRepository;
    }

    async create(post: PostForCreation): Promise<PostDTO> {
        return await this.postRepository.create(post);  
    }
}