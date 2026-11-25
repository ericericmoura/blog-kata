import { beforeEach, describe, expect, test } from "vitest";

describe("User Repository", () => {
    let userRepository: PrismaUserRepository;

    beforeEach(() => {
        userRepository = new PrismaUserRepository();
    })

    test("creates an user", async () => {
        const input = getMockupUserForCreation();
        const {id}  = await userRepository.create(input);

        const found = await userRepository.getById(id);
        expect(found).toMatchObject(input);
    });

    test("returns null for a non-existent id", async () => {
        const found = await userRepository.getById(1);
        expect(found).toBeNull();
    });
})