import type { UserForCreation } from "@/repositories/users/users.repository.interface";
import { faker } from "@faker-js/faker";

export const getMockupUserForCreation = (): UserForCreation => {
    return {
        username    : faker.internet.username(),
        email       : faker.internet.email(),
        passwordHash: "@MyCoolPassword"   , 
    }
}