export interface User {
    id:           number ,
    username:     string ,
    email:        string ,
    passwordHash: string ,
    isActive:     boolean,
    createdAt:    Date   ,
    updatedAt:    Date   ,
}

export type UserForCreation = Pick<User, "username" | "email" | "passwordHash">;

export interface UserRepository {
    create (post: UserForCreation): Promise<User>;
    getById(id: number): Promise<User | null>;
}