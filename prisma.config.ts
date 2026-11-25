import { definePrismaConfig } from '@prisma/cli-engine';
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config';
import env from './src/env';

export default definePrismaConfig({
  orm: ormConfig({
    contract: "./src/prisma/contract.prisma",
    db: {
      connection: env.TESTING ? env.TEST_DATABASE_URL : env.DATABASE_URL,
    },
  }),
});
