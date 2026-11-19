import type { Post, PostForCreation, PostQueryOptions, PostRepository } from "@/repositories/posts.repository.interface.js"

export class InMemoryPostRepository implements PostRepository {    
    private posts: Map<number, Post> = new Map();

    private currentId: number = 1;

    async create(post: PostForCreation): Promise<Post> {
        const createdPost = {
            ...post,
            id       : this.currentId,
            isActive : true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.posts.set(this.currentId, createdPost);

        this.currentId++;
        return createdPost;
    }    

    async getMany(options: PostQueryOptions = {skip: 0, take: 10}): Promise<Post[]> {
        let { skip, take } = options;
        let end: number = skip + take;        
        return Array.from(this.posts.values()).slice(skip, end);
    }

    async getById(id: number): Promise<Post | null> {
        return this.posts.get(id) ?? null;
    }

    async delete(id: number): Promise<void> {
        this.posts.delete(id);
    }
}