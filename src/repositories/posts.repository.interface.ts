export interface Post {
    id       : number,
    title    : string,
    body     : string,    
    authorId : number,
    isActive : boolean,
    createdAt: Date,
    updatedAt: Date,
}

export type PostForCreation = Pick<Post, "title" | "body" | "authorId">;

export interface PostRepository {
    create(post: PostForCreation): Post;
}