#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/62597d5e76d2564dd700930a23ac0ba8c921d4735d2e4f242793383c0633ed7d/contract';
import endContract from '../../snapshots/62597d5e76d2564dd700930a23ac0ba8c921d4735d2e4f242793383c0633ed7d/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/772bd4aece7a9fbbccfdd3ccbaf280b92e0f367f9e35d80ec7feb7a5d08761c1/contract';
import startContract from '../../snapshots/772bd4aece7a9fbbccfdd3ccbaf280b92e0f367f9e35d80ec7feb7a5d08761c1/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropColumn({ schema: 'public', table: 'Users', column: 'is_active' }),
      this.dropColumn({ schema: 'public', table: 'Users', column: 'password_hash' }),
      this.addColumn({
        schema: 'public',
        table: 'Users',
        column: col('isActive', 'bool', {
          notNull: true,
          default: lit(true),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'Users',
        column: 'passwordHash',
        type: 'text',
        temporaryDefault: sql`''`,
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
