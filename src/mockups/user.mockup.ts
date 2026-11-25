import type { UserForCreation } from "@/repositories/users/users.repository.interface";

export const getMockupUserForCreation = (): UserForCreation => {
    return {
        username    : "testuser123"       ,
        email       : "testuser@gmail.com",
        passwordHash: "@MyCoolPassword"   , 
    }
}