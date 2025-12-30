import * as migration_20251229_173830 from './20251229_173830';
import * as migration_20251230_071306 from './20251230_071306';
import * as migration_20251230_095655 from './20251230_095655';

export const migrations = [
  {
    up: migration_20251229_173830.up,
    down: migration_20251229_173830.down,
    name: '20251229_173830',
  },
  {
    up: migration_20251230_071306.up,
    down: migration_20251230_071306.down,
    name: '20251230_071306',
  },
  {
    up: migration_20251230_095655.up,
    down: migration_20251230_095655.down,
    name: '20251230_095655'
  },
];
