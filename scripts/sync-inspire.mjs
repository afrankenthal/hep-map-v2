import { resolve } from 'node:path';
import { atomicJson, fetchSnapshot } from './lib/inspire.mjs';

try {
  const snapshot = await fetchSnapshot({ onPage: ({ page, fetched, total }) => console.error(`INSPIRE page ${page}: ${fetched}/${total}`) });
  await atomicJson(resolve('data/inspire/snapshot.json'), snapshot);
  console.log(`Saved ${snapshot.records.length} source records. Reviewed website content was not modified.`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
