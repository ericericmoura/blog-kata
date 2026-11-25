import { db } from "@/prisma/db";
import type { User, UserForCreation, UserRepository } from "./users.repository.interface";

export class PrismaUserRepository implements UserRepository {
    create(post: UserForCreation): Promise<User> {
        throw new Error("Method not implemented.");
    }

    async getById(id: number): Promise<User | null> {
        const found = await db.orm.public.Users.where({id}).first();        
        return found;
    }
}