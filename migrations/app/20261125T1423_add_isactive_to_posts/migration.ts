#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/09d563962b21e6562f75779ba87403e4bf2755ee6e35ab6b85e297644ec9f3e5/contract';
import endContract from '../../snapshots/09d563962b21e6562f75779ba87403e4bf2755ee6e35ab6b85e297644ec9f3e5/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/62597d5e76d2564dd700930a23ac0ba8c921d4735d2e4f242793383c0633ed7d/contract';
import startContract from '../../snapshots/62597d5e76d2564dd700930a23ac0ba8c921d4735d2e4f242793383c0633ed7d/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Posts',
        column: col('isActive', 'bool', {
          notNull: true,
          default: lit(true),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
