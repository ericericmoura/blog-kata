import { ForbiddenException } from "@/exceptions/exceptions.js";
import type { Post, PostForCreation, PostForUpdate, PostQueryOptions, PostRepository } from "@/repositories/posts.repository.interface.js";
import { openSync } from "fs";

export class PostService {
    private postRepository: PostRepository;

    constructor(postRepository: PostRepository) {
        this.postRepository = postRepository;
    }

    async create(post: PostForCreation): Promise<Post> {
        return await this.postRepository.create(post);  
    }

    async delete(id: number, authorId: number): Promise<void> {
        await this.validatePostOwner(id, authorId);
        await this.postRepository.delete(id);
    }

    async update(id: number, body: PostForUpdate, authorId: number): Promise<Post | null> {
        await this.validatePostOwner(id, authorId);
        return await this.postRepository.update(id, body);
    }

    async getMany(options: PostQueryOptions): Promise<Post[]> {
        return await this.postRepository.getMany(options);
    }

    private async validatePostOwner(id: number, authorId: number): Promise<void> {
        const post = await this.postRepository.getById(id);
        if (post?.authorId !== authorId) throw new ForbiddenException("You are not allowed to modify this post.");
    }
}