import dotenv from "dotenv"
import * as z from "zod";

dotenv.config();

const envSchema = z.object({
    TEST_DATABASE_URL: z.url(),
    DATABASE_URL     : z.url(),
    TESTING          : z.coerce.boolean().default(false),
})

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error(result.error);
    process.exit(1);
}

const env = result.data;
export default env;