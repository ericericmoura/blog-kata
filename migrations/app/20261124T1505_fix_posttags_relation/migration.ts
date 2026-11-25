#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/772bd4aece7a9fbbccfdd3ccbaf280b92e0f367f9e35d80ec7feb7a5d08761c1/contract';
import endContract from '../../snapshots/772bd4aece7a9fbbccfdd3ccbaf280b92e0f367f9e35d80ec7feb7a5d08761c1/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/fb25abd7f532a61c85c9cf04660e92b77442860f5266a811ddef4f112e7e4242/contract';
import startContract from '../../snapshots/fb25abd7f532a61c85c9cf04660e92b77442860f5266a811ddef4f112e7e4242/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'PostTags',
        constraint: 'PostTags_postId_tagId_key',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'PostTags',
        constraint: 'PostTags_pkey',
        kind: 'primaryKey',
      }),
      this.dropColumn({ schema: 'public', table: 'PostTags', column: 'id' }),
      this.addPrimaryKey({
        schema: 'public',
        table: 'PostTags',
        constraint: 'PostTags_pkey',
        columns: ['postId', 'tagId'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
