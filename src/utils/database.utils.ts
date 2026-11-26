import { db } from "@/prisma/db";

export const clearDb = async (): Promise<void> => {
    await db.orm.public.Users   .where({}).deleteAll();
    await db.orm.public.Posts   .where({}).deleteAll();
    await db.orm.public.Tags    .where({}).deleteAll();
    await db.orm.public.PostTags.where({}).deleteAll();
}