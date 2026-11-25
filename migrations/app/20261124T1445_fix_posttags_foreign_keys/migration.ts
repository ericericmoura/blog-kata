#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/b4a748ec262eb4340bea4967d7d29c8d3a711158f05488df48e1f8fde9a50ae7/contract';
import startContract from '../../snapshots/b4a748ec262eb4340bea4967d7d29c8d3a711158f05488df48e1f8fde9a50ae7/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/fb25abd7f532a61c85c9cf04660e92b77442860f5266a811ddef4f112e7e4242/contract';
import endContract from '../../snapshots/fb25abd7f532a61c85c9cf04660e92b77442860f5266a811ddef4f112e7e4242/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'PostTags',
        constraint: 'PostTags_authorId_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'PostTags',
        constraint: 'PostTags_postId_authorId_key',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'PostTags',
        index: 'PostTags_authorId_idx_e47547ed',
      }),
      this.dropColumn({ schema: 'public', table: 'PostTags', column: 'authorId' }),
      this.addRequiredColumnToEmptyTable({
        schema: 'public',
        table: 'PostTags',
        column: 'tagId',
        type: 'int4',
      }),
      this.addUnique({
        schema: 'public',
        table: 'PostTags',
        constraint: 'PostTags_postId_tagId_key',
        columns: ['postId', 'tagId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'PostTags',
        index: 'PostTags_tagId_idx_86854244',
        columns: ['tagId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'PostTags',
        foreignKey: {
          name: 'PostTags_tagId_fkey',
          columns: ['tagId'],
          references: { schema: 'public', table: 'Tags', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
