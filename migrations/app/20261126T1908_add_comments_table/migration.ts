#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/09d563962b21e6562f75779ba87403e4bf2755ee6e35ab6b85e297644ec9f3e5/contract';
import startContract from '../../snapshots/09d563962b21e6562f75779ba87403e4bf2755ee6e35ab6b85e297644ec9f3e5/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/6f68179e126e9eb557cc46bdb6ad966ded75aadcbe6dc96877b3aef6ec0d10d5/contract';
import endContract from '../../snapshots/6f68179e126e9eb557cc46bdb6ad966ded75aadcbe6dc96877b3aef6ec0d10d5/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Comments',
        columns: [
          col('body', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('postId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Comments',
        index: 'Comments_postId_idx_a7a72715',
        columns: ['postId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Comments',
        index: 'Comments_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Comments',
        foreignKey: {
          name: 'Comments_postId_fkey',
          columns: ['postId'],
          references: { schema: 'public', table: 'Posts', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Comments',
        foreignKey: {
          name: 'Comments_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'Users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
