#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/038b6f66e8591bf2486ed83e1d766180a5258ab5d9162c9e7bee2769af4f09a8/contract';
import startContract from '../../snapshots/038b6f66e8591bf2486ed83e1d766180a5258ab5d9162c9e7bee2769af4f09a8/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/b4a748ec262eb4340bea4967d7d29c8d3a711158f05488df48e1f8fde9a50ae7/contract';
import endContract from '../../snapshots/b4a748ec262eb4340bea4967d7d29c8d3a711158f05488df48e1f8fde9a50ae7/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.setDefault({
        schema: 'public',
        table: 'PostTags',
        column: col('createdAt', 'timestamptz(3)', {
          default: fn(sql`now()`),
          codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
        }),
      }),
      this.setDefault({
        schema: 'public',
        table: 'Posts',
        column: col('createdAt', 'timestamptz(3)', {
          default: fn(sql`now()`),
          codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
        }),
      }),
      this.setDefault({
        schema: 'public',
        table: 'Tags',
        column: col('createdAt', 'timestamptz(3)', {
          default: fn(sql`now()`),
          codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
        }),
      }),
      this.setDefault({
        schema: 'public',
        table: 'Users',
        column: col('createdAt', 'timestamptz(3)', {
          default: fn(sql`now()`),
          codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
