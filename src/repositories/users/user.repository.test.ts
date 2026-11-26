import { beforeEach, describe, expect, test } from "vitest";
import { PrismaUserRepository } from "./user.repository";
import { getMockupUserForCreation } from "@/mockups/user.mockup";
import { db } from "@/prisma/db";
import { clearDb } from "@/utils/database.utils";

describe("User Repository", () => {
    let userRepository = new PrismaUserRepository();

    beforeEach(async () => {
        await clearDb();
    })

    test("creates an user", async () => {
        const input = getMockupUserForCreation();
        const {id}  = await userRepository.create(input);

        const found = await db.orm.public.Users.where({id}).first();
        expect(found).toMatchObject(input);
    });

    test("returns null for a non-existent id", async () => {
        const found = await userRepository.getById(1);
        expect(found).toBeNull();
    });
})