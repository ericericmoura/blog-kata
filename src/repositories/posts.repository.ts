import type { Post, PostForCreation, PostQueryOptions, PostRepository } from "@/repositories/posts.repository.interface.js"

export class InMemoryPostRepository implements PostRepository {    
    private posts: Post[] = [];

    private currentId: number = 1;

    async create(post: PostForCreation): Promise<Post> {
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

    async getMany(options: PostQueryOptions = {skip: 0, take: 10}): Promise<Post[]> {
        let { skip, take } = options;
        let end: number = skip + take;        
        return this.posts.slice(skip, end);
    }
}