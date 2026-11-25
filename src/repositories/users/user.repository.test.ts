import { beforeEach, describe, test } from "vitest";

describe("User Repository", () => {
    let userRepository: PrismaUserRepository;

    beforeEach(() => {
        userRepository = new PrismaUserRepository();
    })

    test.todo("creates an user");
    test.todo("gets a existing user by id");
})