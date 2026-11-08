import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { EXPERIMENTS } from '../src/lib/catalogue.ts';
import { atomicJson, publicAudit, reconcile } from './lib/inspire.mjs';

try {
  const snapshot = JSON.parse(await readFile(resolve('data/inspire/snapshot.json'), 'utf8'));
  const links = JSON.parse(await readFile(resolve('data/inspire/links.json'), 'utf8'));
  const notes = JSON.parse(await readFile(resolve('data/inspire/review-notes.json'), 'utf8'));
  const report = reconcile(EXPERIMENTS, snapshot, links, notes);
  await atomicJson(resolve('data/inspire/reconciliation.json'), report);
  await atomicJson(resolve('data/inspire/catalogue-links.json'), publicAudit(report));
  console.log(JSON.stringify(report.counts, null, 2));
  console.log('See data/inspire/reconciliation.json. Candidates are not approved links; unlinked source records are not automatically missing experiments.');
} catch (error) { console.error(error.message); process.exitCode = 1; }
