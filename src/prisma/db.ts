import postgres from '@prisma/orm-postgres/runtime';
import { contractFromJson } from '@prisma/orm-postgres/static';
import type { Contract } from './contract.d.js';
import contractJson from './contract.json' with { type: 'json' };
import env from '@/env.js';

export const contract = contractFromJson<Contract>(contractJson);

export const db = postgres({
  contract,
  url: env.TESTING ? env.TEST_DATABASE_URL : env.DATABASE_URL,
});