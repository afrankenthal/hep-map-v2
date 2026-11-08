import test from 'node:test';
import assert from 'node:assert/strict';
import { MILESTONES, EXPERIMENTS } from '../src/lib/catalogue.ts';
import { milestoneSitesThrough } from '../src/lib/timeline.ts';

test('history reveals sites cumulatively and never leaks later events', () => {
  const firstAppearance = new Map();
  MILESTONES.forEach((event, i) => { if (!firstAppearance.has(event.experiment)) firstAppearance.set(event.experiment, i); });
  let previous = new Set();
  for (let i = 0; i < MILESTONES.length; i++) {
    const sites = milestoneSitesThrough(i);
    assert.ok(sites.has(MILESTONES[i].experiment));
    for (const id of previous) assert.ok(sites.has(id));
    for (const record of EXPERIMENTS) assert.equal(sites.has(record.id), firstAppearance.has(record.id) && firstAppearance.get(record.id) <= i);
    previous = sites;
  }
  assert.equal(milestoneSitesThrough(0).size, 1);
  assert.equal(previous.size, firstAppearance.size);
});

test('multiple events at the same site do not duplicate it and invalid positions reveal nothing', () => {
  const repeated = MILESTONES.findIndex((event, i) => MILESTONES.slice(0, i).some(earlier => earlier.experiment === event.experiment));
  assert.ok(repeated > 0);
  assert.equal(milestoneSitesThrough(repeated).size, milestoneSitesThrough(repeated - 1).size);
  for (const index of [-1, NaN, Infinity, 0.5, MILESTONES.length]) assert.equal(milestoneSitesThrough(index).size, 0);
});
