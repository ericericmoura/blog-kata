import { db } from "@/prisma/db";

export const clearDb = async (): Promise<void> => {
    const plan = db.raw.sql`
        TRUNCATE "Users", "Posts", "Tags", "Comments", "PostTags"
        RESTART IDENTITY CASCADE
    `.affectedCount().build();

    await db.execute(plan);
}