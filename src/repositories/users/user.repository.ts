import { db } from "@/prisma/db";
import type { User, UserForCreation, UserRepository } from "./users.repository.interface";

export class PrismaUserRepository implements UserRepository {
    async create(user: UserForCreation): Promise<User> {
        const created = await db.orm.public.Users.create(user);
        return created;
    }

    async getById(id: number): Promise<User | null> {
        const found = await db.orm.public.Users.where({id}).first();        
        return found;
    }
}