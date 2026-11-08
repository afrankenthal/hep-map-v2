import test from 'node:test';
import assert from 'node:assert/strict';
import { SURPRISES, pickSurprise } from '../src/lib/surprise.ts';
import { EXPERIMENTS, MILESTONES, readSharedView, writeSharedView } from '../src/lib/catalogue.ts';

test('every surprise opens an existing record and facts and milestones have sources', () => {
  assert.equal(new Set(SURPRISES.map(s => s.key)).size, SURPRISES.length);
  for (const item of SURPRISES) {
    const record = EXPERIMENTS.find(e => e.id === item.experiment);
    assert.ok(record);
    if (item.kind === 'fact') assert.match(record.funFact.sourceUrl, /^https:\/\//);
    if (item.kind === 'milestone') {
      assert.equal(MILESTONES[item.milestone].experiment, record.id);
      assert.match(MILESTONES[item.milestone].url, /^https:\/\//);
    }
    const restored = readSharedView(writeSharedView({ query: '', topic: 'all', stage: 'all', mode: 'all', particle: null, story: null, stop: 0, experiment: item.experiment, milestone: item.milestone }));
    assert.equal(restored.experiment, item.experiment);
    assert.equal(restored.milestone, item.milestone);
  }
});

test('all three kinds remain reachable even when skipping a fact-bearing record', () => {
  for (const [roll, kind] of [[0, 'experiment'], [0.4, 'fact'], [0.99, 'milestone']]) {
    const rolls = [roll, 0.5];
    const item = pickSurprise('cms', () => rolls.shift());
    assert.equal(item.kind, kind);
    assert.notEqual(item.experiment, 'cms');
  }
});

test('a next surprise never repeats the currently selected experiment across kinds', () => {
  for (const current of EXPERIMENTS) {
    for (const roll of [0, 0.4, 0.999999]) {
      assert.notEqual(pickSurprise(current.id, () => roll).experiment, current.id);
    }
  }
});
