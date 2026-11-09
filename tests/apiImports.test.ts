import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Vercel runs api/ as native Node ESM: a relative import without ".js" builds fine
// but crashes the function at runtime (ERR_MODULE_NOT_FOUND). This guards against it.
describe('api/ relative imports', () => {
  const dir = join(__dirname, '..', 'api');
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
    it(`${file} uses .js extensions`, () => {
      const src = readFileSync(join(dir, file), 'utf8');
      const bad = [...src.matchAll(/from\s+['"](\.{1,2}\/[^'"]+)['"]/g)].map((m) => m[1]).filter((p) => !p.endsWith('.js'));
      expect(bad).toEqual([]);
    });
  }
});
