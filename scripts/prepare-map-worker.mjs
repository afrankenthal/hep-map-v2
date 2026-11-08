import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('..', import.meta.url));
const dist = dirname(fileURLToPath(import.meta.resolve('maplibre-gl')));
const output = resolve(project, 'public/maplibre');
await mkdir(output, { recursive: true });
// The v6 module worker imports its sibling shared module. Serve both together
// from our own origin, matching the exact installed (locked) library version.
for (const name of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  await copyFile(resolve(dist, name), resolve(output, name));
}
await copyFile(resolve(dist, '../LICENSE.txt'), resolve(output, 'LICENSE.txt'));
